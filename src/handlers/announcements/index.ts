import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamodb from '../../utils/dynamodb';
import * as response from '../../utils/response';
import { Announcement } from '../../types';

const ANNOUNCEMENTS_TABLE = process.env.ANNOUNCEMENTS_TABLE || 'd2l-plus-auth-announcements';

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { path, httpMethod, pathParameters } = event;

        // Route the request to the appropriate handler
        if (httpMethod === 'GET') {
            if (pathParameters?.courseId && path.match(/^\/announcements\/course\/[^\/]+$/)) {
                return await getAnnouncementsByCourse(event);
            }
        }

        return response.error(404, 'Route not found');
    } catch (error) {
        console.error('Error in announcements handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};

/**
 * Get all announcements for a specific course
 */
export const getAnnouncementsByCourse = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { courseId } = event.pathParameters || {};

        if (!courseId) {
            return response.error(400, 'Missing course ID');
        }

        // Query announcements for this course
        const announcements = await dynamodb.query({
            TableName: ANNOUNCEMENTS_TABLE,
            IndexName: 'CourseIndex',
            KeyConditionExpression: 'courseId = :courseId',
            ExpressionAttributeValues: {
                ':courseId': courseId,
            },
            // Sort by dateTime in descending order (newest first)
            ScanIndexForward: false,
        });

        if (!announcements || announcements.length === 0) {
            return response.success([]);
        }

        return response.success(announcements);
    } catch (error) {
        console.error('Error getting course announcements:', error);
        return response.error(500, 'Could not get course announcements');
    }
};
