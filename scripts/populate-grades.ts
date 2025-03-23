import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient({
    region: 'us-east-1',
});

const TABLES = {
    ASSIGNMENTS: 'd2l-plus-auth-assignments',
    ENROLLMENTS: 'd2l-plus-auth-enrollments',
    GRADES: 'd2l-plus-auth-grades',
};

async function getAllAssignments() {
    try {
        const result = await dynamodb
            .scan({
                TableName: TABLES.ASSIGNMENTS,
            })
            .promise();

        return result.Items || [];
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return [];
    }
}

async function getEnrollments() {
    try {
        const result = await dynamodb
            .scan({
                TableName: TABLES.ENROLLMENTS,
            })
            .promise();

        return result.Items || [];
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        return [];
    }
}

async function createGrades() {
    try {
        // Get all assignments
        const assignments = await getAllAssignments();
        console.log(`Found ${assignments.length} assignments`);

        if (assignments.length === 0) {
            console.log('No assignments found. Please populate assignments first.');
            return;
        }

        // Get all enrollments to find student-course relationships
        const enrollments = await getEnrollments();
        console.log(`Found ${enrollments.length} enrollments`);

        if (enrollments.length === 0) {
            console.log('No enrollments found. Please populate enrollments first.');
            return;
        }

        // Create a map of courseId -> studentIds (users enrolled in that course)
        const courseEnrollments = new Map();
        for (const enrollment of enrollments) {
            if (!courseEnrollments.has(enrollment.courseId)) {
                courseEnrollments.set(enrollment.courseId, []);
            }
            courseEnrollments.get(enrollment.courseId).push(enrollment.userId);
        }

        // For each assignment, create grades for enrolled students
        const gradesToCreate = [];

        for (const assignment of assignments) {
            const enrolledStudents = courseEnrollments.get(assignment.courseId) || [];

            // Skip if no students are enrolled in this course
            if (enrolledStudents.length === 0) {
                console.log(
                    `No students enrolled in course ${assignment.courseId} for assignment ${assignment.id}`
                );
                continue;
            }

            console.log(
                `Creating grades for assignment ${assignment.title} (${assignment.id}) for ${enrolledStudents.length} students`
            );

            // Create grades for each enrolled student
            for (const studentId of enrolledStudents) {
                // Generate a random grade between 65 and 100
                const randomGrade = Math.floor(Math.random() * 36) + 65;

                const grade = {
                    id: uuidv4(),
                    userId: studentId,
                    assignmentId: assignment.id,
                    title: assignment.title,
                    grade: randomGrade,
                    dateTime: new Date().toISOString(),
                };

                gradesToCreate.push(grade);
            }
        }

        // Save all grades to DynamoDB
        console.log(`Creating ${gradesToCreate.length} grades in DynamoDB`);

        for (const grade of gradesToCreate) {
            await dynamodb
                .put({
                    TableName: TABLES.GRADES,
                    Item: grade,
                })
                .promise();

            console.log(
                `Created grade for assignment "${grade.title}" for user ${grade.userId}: ${grade.grade}`
            );
        }

        console.log('Successfully populated grades table!');
    } catch (error) {
        console.error('Error creating grades:', error);
    }
}

// Run the script
createGrades();
