import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamodb from '../../utils/dynamodb';
import * as response from '../../utils/response';
import { Course } from '../../types';

const TABLE_NAME = process.env.COURSES_TABLE || 'd2l-plus-auth-courses';

// Simple ID generator function that doesn't require uuid
function generateId(): string {
    return `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { path, httpMethod, pathParameters } = event;

        // Route the request to the appropriate handler
        if (httpMethod === 'GET') {
            if (path === '/courses') {
                return await list();
            } else if (pathParameters?.id && path.match(/^\/courses\/[^\/]+$/)) {
                return await get(event);
            } else if (
                pathParameters?.professorId &&
                path.match(/^\/courses\/professor\/[^\/]+$/)
            ) {
                return await listByProfessor(event);
            }
        } else if (httpMethod === 'POST' && path === '/courses') {
            return await create(event);
        } else if (
            httpMethod === 'PUT' &&
            pathParameters?.id &&
            path.match(/^\/courses\/[^\/]+$/)
        ) {
            return await update(event);
        } else if (
            httpMethod === 'DELETE' &&
            pathParameters?.id &&
            path.match(/^\/courses\/[^\/]+$/)
        ) {
            return await remove(event);
        }

        return response.error(404, 'Route not found');
    } catch (error) {
        console.error('Error in courses handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const data = JSON.parse(event.body || '{}');
        const { title, lectures, professorId, semester } = data;

        if (!title || !professorId || !semester) {
            return response.error(400, 'Missing required fields');
        }

        const course: Course = {
            id: generateId(),
            title,
            lectures: lectures || [],
            professorId,
            semester,
        };

        await dynamodb.create({
            TableName: TABLE_NAME,
            Item: course,
        });

        return response.success(course);
    } catch (error) {
        console.error('Error creating course:', error);
        return response.error(500, 'Could not create course');
    }
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { id } = event.pathParameters || {};

        if (!id) {
            return response.error(400, 'Missing course ID');
        }

        const course = await dynamodb.get({
            TableName: TABLE_NAME,
            Key: { id },
        });

        if (!course) {
            return response.error(404, 'Course not found');
        }

        return response.success(course);
    } catch (error) {
        console.error('Error getting course:', error);
        return response.error(500, 'Could not get course');
    }
};

export const list = async (): Promise<APIGatewayProxyResult> => {
    try {
        const courses = await dynamodb.scan({
            TableName: TABLE_NAME,
        });

        return response.success(courses);
    } catch (error) {
        console.error('Error listing courses:', error);
        return response.error(500, 'Could not list courses');
    }
};

export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { id } = event.pathParameters || {};
        const data = JSON.parse(event.body || '{}');

        if (!id) {
            return response.error(400, 'Missing course ID');
        }

        const { title, lectures, semester } = data;
        const updateExpression = [];
        const expressionAttributeValues: any = {};
        const expressionAttributeNames: any = {};

        if (title) {
            updateExpression.push('#title = :title');
            expressionAttributeValues[':title'] = title;
            expressionAttributeNames['#title'] = 'title';
        }

        if (lectures) {
            updateExpression.push('#lectures = :lectures');
            expressionAttributeValues[':lectures'] = lectures;
            expressionAttributeNames['#lectures'] = 'lectures';
        }

        if (semester) {
            updateExpression.push('#semester = :semester');
            expressionAttributeValues[':semester'] = semester;
            expressionAttributeNames['#semester'] = 'semester';
        }

        if (updateExpression.length === 0) {
            return response.error(400, 'No fields to update');
        }

        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'ALL_NEW',
        };

        const result = await dynamodb.update(params);
        return response.success(result.Attributes);
    } catch (error) {
        console.error('Error updating course:', error);
        return response.error(500, 'Could not update course');
    }
};

export const remove = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { id } = event.pathParameters || {};

        if (!id) {
            return response.error(400, 'Missing course ID');
        }

        await dynamodb.remove({
            TableName: TABLE_NAME,
            Key: { id },
        });

        return response.success({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        return response.error(500, 'Could not delete course');
    }
};

export const listByProfessor = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { professorId } = event.pathParameters || {};

        if (!professorId) {
            return response.error(400, 'Missing professor ID');
        }

        const courses = await dynamodb.query({
            TableName: TABLE_NAME,
            IndexName: 'ProfessorIndex',
            KeyConditionExpression: 'professorId = :professorId',
            ExpressionAttributeValues: {
                ':professorId': professorId,
            },
        });

        return response.success(courses);
    } catch (error) {
        console.error('Error listing courses by professor:', error);
        return response.error(500, 'Could not list courses by professor');
    }
};
