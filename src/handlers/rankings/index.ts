import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamodb from '../../utils/dynamodb';
import * as response from '../../utils/response';
import { ProfessorRanking, CourseRanking } from '../../types';

const PROFESSOR_RANKINGS_TABLE =
    process.env.PROFESSOR_RANKINGS_TABLE || 'd2l-plus-auth-professor-rankings';
const COURSE_RANKINGS_TABLE = process.env.COURSE_RANKINGS_TABLE || 'd2l-plus-auth-course-rankings';

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { path, httpMethod } = event;

        // Route the request to the appropriate handler
        if (httpMethod === 'GET') {
            if (path === '/rankings/professors') {
                return await getProfessorRankings();
            } else if (path === '/rankings/courses') {
                return await getCourseRankings();
            }
        }

        return response.error(404, 'Route not found');
    } catch (error) {
        console.error('Error in rankings handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};

/**
 * Get all professor rankings
 */
export const getProfessorRankings = async (): Promise<APIGatewayProxyResult> => {
    try {
        // Get all professor rankings from DynamoDB
        const rankings = await dynamodb.scan({
            TableName: PROFESSOR_RANKINGS_TABLE,
        });

        if (!rankings || rankings.length === 0) {
            return response.success([]);
        }

        // Sort by rank in descending order (highest rank first)
        rankings.sort((a, b) => b.rank - a.rank);

        return response.success(rankings);
    } catch (error) {
        console.error('Error getting professor rankings:', error);
        return response.error(500, 'Could not get professor rankings');
    }
};

/**
 * Get all course rankings
 */
export const getCourseRankings = async (): Promise<APIGatewayProxyResult> => {
    try {
        // Get all course rankings from DynamoDB
        const rankings = await dynamodb.scan({
            TableName: COURSE_RANKINGS_TABLE,
        });

        if (!rankings || rankings.length === 0) {
            return response.success([]);
        }

        // Sort by rank in descending order (highest rank first)
        rankings.sort((a, b) => b.rank - a.rank);

        return response.success(rankings);
    } catch (error) {
        console.error('Error getting course rankings:', error);
        return response.error(500, 'Could not get course rankings');
    }
};
