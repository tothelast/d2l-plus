import * as dynamodb from './dynamodb';
import {
    User,
    Enrollment,
    Course,
    Professor,
    Assignment,
    Announcement,
    Grade,
    Ranking,
    UserContextData,
    ExtendedCourse,
} from '../types';

// Table names from environment variables
const USERS_TABLE = process.env.USERS_TABLE || 'd2l-plus-auth-users';
const ENROLLMENTS_TABLE = process.env.ENROLLMENTS_TABLE || 'd2l-plus-auth-enrollments';
const COURSES_TABLE = process.env.COURSES_TABLE || 'd2l-plus-auth-courses';
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE || 'd2l-plus-auth-assignments';
const GRADES_TABLE = process.env.GRADES_TABLE || 'd2l-plus-auth-grades';
const ANNOUNCEMENTS_TABLE = process.env.ANNOUNCEMENTS_TABLE || 'd2l-plus-auth-announcements';
const PROFESSORS_TABLE = process.env.PROFESSORS_TABLE || 'd2l-plus-auth-professors';
const COURSE_RANKINGS_TABLE = process.env.COURSE_RANKINGS_TABLE || 'd2l-plus-auth-course-rankings';
const PROFESSOR_RANKINGS_TABLE =
    process.env.PROFESSOR_RANKINGS_TABLE || 'd2l-plus-auth-professor-rankings';

/**
 * Gathers all relevant data for a specific user to be used by the AI
 * This combines information from multiple tables to create a comprehensive context
 *
 * @param userId The ID of the user to gather data for
 */
export const gatherUserContextData = async (userId: string): Promise<UserContextData> => {
    try {
        // Get user profile information
        const user = (await dynamodb.get({
            TableName: USERS_TABLE,
            Key: { id: userId },
        })) as User;

        if (!user) {
            throw new Error('User not found');
        }

        // Get user enrollments
        const enrollments = ((await dynamodb.query({
            TableName: ENROLLMENTS_TABLE,
            IndexName: 'UserIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        })) || []) as Enrollment[];

        // Get course details for all enrolled courses
        const courseIds = enrollments.map((enrollment) => enrollment.courseId);

        // Get courses (sequential for simplicity - could be parallelized)
        const courses: ExtendedCourse[] = [];

        for (const courseId of courseIds) {
            const baseCourse = (await dynamodb.get({
                TableName: COURSES_TABLE,
                Key: { id: courseId },
            })) as Course;

            if (baseCourse) {
                // Create an extended course object
                const course: ExtendedCourse = {
                    ...baseCourse,
                };

                // Get professor information for each course
                if (course.professorId) {
                    const professor = (await dynamodb.get({
                        TableName: PROFESSORS_TABLE,
                        Key: { id: course.professorId },
                    })) as Professor;

                    course.professorDetails = professor || null;
                }

                // Get course announcements
                const announcements = ((await dynamodb.query({
                    TableName: ANNOUNCEMENTS_TABLE,
                    IndexName: 'CourseIndex',
                    KeyConditionExpression: 'courseId = :courseId',
                    ExpressionAttributeValues: {
                        ':courseId': courseId,
                    },
                })) || []) as Announcement[];

                course.announcements = announcements;

                // Get course assignments
                const assignments = ((await dynamodb.query({
                    TableName: ASSIGNMENTS_TABLE,
                    IndexName: 'CourseDeadlineIndex',
                    KeyConditionExpression: 'courseId = :courseId',
                    ExpressionAttributeValues: {
                        ':courseId': courseId,
                    },
                })) || []) as Assignment[];

                course.assignments = assignments;

                // Get user's grades for this course
                const grades = ((await dynamodb.query({
                    TableName: GRADES_TABLE,
                    IndexName: 'UserIndex',
                    KeyConditionExpression: 'userId = :userId',
                    ExpressionAttributeValues: {
                        ':userId': userId,
                    },
                })) || []) as Grade[];

                // Filter grades to only those for assignments in this course
                const assignmentIds = assignments.map((a) => a.id);
                const courseGrades = grades.filter((grade) =>
                    assignmentIds.includes(grade.assignmentId)
                );

                course.grades = courseGrades;

                // Get course ranking if available
                const courseRanking = (await dynamodb.get({
                    TableName: COURSE_RANKINGS_TABLE,
                    Key: { courseId: courseId },
                })) as Ranking;

                course.ranking = courseRanking || null;

                courses.push(course);
            }
        }

        // Prepare a comprehensive data object
        const contextData: UserContextData = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name || 'Student',
            },
            enrollments: enrollments,
            courses: courses,
            // Summary information
            summary: {
                enrolledCourseCount: courses.length,
                upcomingAssignments: courses
                    .flatMap((c) => c.assignments || [])
                    .filter((a) => {
                        const deadline = new Date(a.deadline);
                        const now = new Date();
                        return deadline > now;
                    })
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .slice(0, 5), // Only include the 5 nearest upcoming assignments
                recentAnnouncements: courses
                    .flatMap((c) =>
                        (c.announcements || []).map((a) => ({ ...a, courseName: c.title }))
                    )
                    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                    .slice(0, 5), // Only include the 5 most recent announcements
            },
        };

        return contextData;
    } catch (error) {
        console.error('Error gathering user context data:', error);
        throw error;
    }
};
