import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamodb from '../../utils/dynamodb';
import * as response from '../../utils/response';

const ENROLLMENTS_TABLE = process.env.ENROLLMENTS_TABLE || 'd2l-plus-auth-enrollments';
const COURSES_TABLE = process.env.COURSES_TABLE || 'd2l-plus-auth-courses';

// Simple ID generator function that doesn't require uuid
function generateId(): string {
    return `enrollment-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { path, httpMethod, pathParameters } = event;

        // Route the request to the appropriate handler
        if (httpMethod === 'GET') {
            if (pathParameters?.userId && path.match(/^\/enrollments\/user\/[^\/]+$/)) {
                return await getStudentCourses(event);
            }
        } else if (httpMethod === 'POST' && path === '/enrollments') {
            return await enroll(event);
        } else if (
            httpMethod === 'DELETE' &&
            pathParameters?.enrollId &&
            path.match(/^\/enrollments\/[^\/]+$/)
        ) {
            return await dropCourse(event);
        }

        return response.error(404, 'Route not found');
    } catch (error) {
        console.error('Error in enrollments handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};

/**
 * Get all courses for a specific student
 */
export const getStudentCourses = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { userId } = event.pathParameters || {};

        if (!userId) {
            return response.error(400, 'Missing student ID');
        }

        // Get all enrollments for this student
        const enrollments = await dynamodb.query({
            TableName: ENROLLMENTS_TABLE,
            IndexName: 'UserIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        });

        if (!enrollments || enrollments.length === 0) {
            return response.success([]);
        }

        // Extract course IDs from enrollments
        const courseIds = enrollments.map((enrollment) => enrollment.courseId);

        // Get all course details in parallel
        const coursePromises = courseIds.map((courseId) =>
            dynamodb.get({
                TableName: COURSES_TABLE,
                Key: { id: courseId },
            })
        );

        const courses = await Promise.all(coursePromises);

        // Filter out any null values (in case a course was deleted)
        const validCourses = courses.filter((course) => course !== null);

        return response.success(validCourses);
    } catch (error) {
        console.error('Error getting student courses:', error);
        return response.error(500, 'Could not get student courses');
    }
};

/**
 * Enroll a student in a course
 */
export const enroll = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const data = JSON.parse(event.body || '{}');
        const { userId, courseId } = data;

        if (!userId || !courseId) {
            return response.error(400, 'Missing required fields');
        }

        // Check if the course exists
        const course = await dynamodb.get({
            TableName: COURSES_TABLE,
            Key: { id: courseId },
        });

        if (!course) {
            return response.error(404, 'Course not found');
        }

        // Check if the enrollment already exists
        const existingEnrollments = await dynamodb.query({
            TableName: ENROLLMENTS_TABLE,
            IndexName: 'UserIndex',
            KeyConditionExpression: 'userId = :userId',
            FilterExpression: 'courseId = :courseId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':courseId': courseId,
            },
        });

        if (existingEnrollments && existingEnrollments.length > 0) {
            return response.error(409, 'Student is already enrolled in this course');
        }

        // Create the enrollment
        const enrollment = {
            id: generateId(),
            userId,
            courseId,
            enrollmentDate: new Date().toISOString(),
        };

        await dynamodb.create({
            TableName: ENROLLMENTS_TABLE,
            Item: enrollment,
        });

        return response.success(enrollment);
    } catch (error) {
        console.error('Error enrolling student:', error);
        return response.error(500, 'Could not enroll student');
    }
};

/**
 * Drop a course enrollment
 */
export const dropCourse = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { enrollId } = event.pathParameters || {};

        if (!enrollId) {
            return response.error(400, 'Missing enrollment ID');
        }

        // Check if the enrollment exists
        const enrollment = await dynamodb.get({
            TableName: ENROLLMENTS_TABLE,
            Key: { id: enrollId },
        });

        if (!enrollment) {
            return response.error(404, 'Enrollment not found');
        }

        // Delete the enrollment
        await dynamodb.remove({
            TableName: ENROLLMENTS_TABLE,
            Key: { id: enrollId },
        });

        return response.success({
            message: 'Enrollment successfully dropped',
            enrollmentId: enrollId,
        });
    } catch (error) {
        console.error('Error dropping course:', error);
        return response.error(500, 'Could not drop course');
    }
};
