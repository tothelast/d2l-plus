import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamodb from '../../utils/dynamodb';
import * as response from '../../utils/response';
import { Grade, Assignment } from '../../types';

const GRADES_TABLE = process.env.GRADES_TABLE || 'd2l-plus-auth-grades';
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE || 'd2l-plus-auth-assignments';

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { path, httpMethod, queryStringParameters } = event;

        // Route the request to the appropriate handler
        if (httpMethod === 'GET' && path === '/grades/course') {
            return await getGradesByCourseAndUser(event);
        }

        return response.error(404, 'Route not found');
    } catch (error) {
        console.error('Error in grades handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};

/**
 * Get all grades for a specific user in a specific course
 */
export const getGradesByCourseAndUser = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { courseId, userId } = event.queryStringParameters || {};

        if (!courseId) {
            return response.error(400, 'Missing course ID');
        }

        if (!userId) {
            return response.error(400, 'Missing user ID');
        }

        // First, get all assignments for this course
        const assignments = await dynamodb.query({
            TableName: ASSIGNMENTS_TABLE,
            IndexName: 'CourseDeadlineIndex',
            KeyConditionExpression: 'courseId = :courseId',
            ExpressionAttributeValues: {
                ':courseId': courseId,
            },
        });

        if (!assignments || assignments.length === 0) {
            return response.success([]);
        }

        // Extract assignment IDs
        const assignmentIds = assignments.map((assignment) => assignment.id);

        // For each assignment, get the user's grade (if it exists)
        const gradesPromises = assignmentIds.map(async (assignmentId) => {
            // Query for the user's grade for this assignment
            const grades = await dynamodb.query({
                TableName: GRADES_TABLE,
                IndexName: 'AssignmentIndex',
                KeyConditionExpression: 'assignmentId = :assignmentId',
                FilterExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':assignmentId': assignmentId,
                    ':userId': userId,
                },
            });

            // If the user has a grade for this assignment, return it
            if (grades && grades.length > 0) {
                return grades[0];
            }

            // Find the assignment details
            const assignment = assignments.find((a) => a.id === assignmentId);

            // If no grade exists, return a placeholder with assignment details
            return {
                id: null,
                userId: userId,
                assignmentId: assignmentId,
                title: assignment?.title || 'Unknown Assignment',
                grade: null,
                dateTime: null,
                assignmentDetails: assignment,
            };
        });

        const grades = await Promise.all(gradesPromises);

        // Sort grades by assignment deadline
        grades.sort((a, b) => {
            const aAssignment = assignments.find((assignment) => assignment.id === a.assignmentId);
            const bAssignment = assignments.find((assignment) => assignment.id === b.assignmentId);

            if (!aAssignment || !bAssignment) return 0;

            return (
                new Date(aAssignment.deadline).getTime() - new Date(bAssignment.deadline).getTime()
            );
        });

        return response.success(grades);
    } catch (error) {
        console.error('Error getting grades:', error);
        return response.error(500, 'Could not get grades');
    }
};
