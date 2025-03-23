import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamodb from '../../utils/dynamodb';
import * as response from '../../utils/response';
import { Assignment } from '../../types';

const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE || 'd2l-plus-auth-assignments';
const ENROLLMENTS_TABLE = process.env.ENROLLMENTS_TABLE || 'd2l-plus-auth-enrollments';

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { path, httpMethod, pathParameters } = event;

        // Route the request to the appropriate handler
        if (httpMethod === 'GET') {
            if (pathParameters?.userId && path.match(/^\/assignments\/deadlines\/user\/[^\/]+$/)) {
                return await getDeadlinesForUser(event);
            }
        }

        return response.error(404, 'Route not found');
    } catch (error) {
        console.error('Error in assignments handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};

/**
 * Get all assignment deadlines for a specific user
 */
export const getDeadlinesForUser = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { userId } = event.pathParameters || {};

        if (!userId) {
            return response.error(400, 'Missing user ID');
        }

        // Get all enrollments for this user
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

        // Get all assignments for these courses
        const assignmentPromises = courseIds.map((courseId) =>
            dynamodb.query({
                TableName: ASSIGNMENTS_TABLE,
                IndexName: 'CourseDeadlineIndex',
                KeyConditionExpression: 'courseId = :courseId',
                ExpressionAttributeValues: {
                    ':courseId': courseId,
                },
            })
        );

        const assignmentsNestedArray = await Promise.all(assignmentPromises);

        // Flatten the array of assignment arrays
        let assignmentsForUser: Assignment[] = [];
        assignmentsNestedArray.forEach((courseAssignments) => {
            if (courseAssignments && courseAssignments.length > 0) {
                assignmentsForUser = [
                    ...assignmentsForUser,
                    ...(courseAssignments as Assignment[]),
                ];
            }
        });

        // Convert UTC dates to UTC-7 (Mountain Time)
        assignmentsForUser = assignmentsForUser.map((assignment) => {
            const deadlineDate = new Date(assignment.deadline);
            const dateTimeDate = new Date(assignment.dateTime);

            // Subtract 7 hours (7 * 60 * 60 * 1000 milliseconds) to convert to UTC-7
            const offsetMillis = 7 * 60 * 60 * 1000;

            // Create new date objects with the offset
            const adjustedDeadline = new Date(deadlineDate.getTime() - offsetMillis);
            const adjustedDateTime = new Date(dateTimeDate.getTime() - offsetMillis);

            return {
                ...assignment,
                deadline: adjustedDeadline.toISOString(),
                dateTime: adjustedDateTime.toISOString(),
            };
        });

        // Sort assignments by deadline (ascending)
        assignmentsForUser.sort((a, b) => {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });

        return response.success(assignmentsForUser);
    } catch (error) {
        console.error('Error getting user assignment deadlines:', error);
        return response.error(500, 'Could not get user assignment deadlines');
    }
};
