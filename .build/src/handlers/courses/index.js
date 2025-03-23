"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByProfessor = exports.remove = exports.update = exports.list = exports.get = exports.create = exports.handler = void 0;
const dynamodb = __importStar(require("../../utils/dynamodb"));
const response = __importStar(require("../../utils/response"));
const TABLE_NAME = process.env.COURSES_TABLE || 'd2l-plus-auth-courses';
// Simple ID generator function that doesn't require uuid
function generateId() {
    return `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
const handler = async (event) => {
    try {
        const { path, httpMethod, pathParameters } = event;
        // Route the request to the appropriate handler
        if (httpMethod === 'GET') {
            if (path === '/courses') {
                return await (0, exports.list)();
            }
            else if (pathParameters?.id && path.match(/^\/courses\/[^\/]+$/)) {
                return await (0, exports.get)(event);
            }
            else if (pathParameters?.professorId &&
                path.match(/^\/courses\/professor\/[^\/]+$/)) {
                return await (0, exports.listByProfessor)(event);
            }
        }
        else if (httpMethod === 'POST' && path === '/courses') {
            return await (0, exports.create)(event);
        }
        else if (httpMethod === 'PUT' &&
            pathParameters?.id &&
            path.match(/^\/courses\/[^\/]+$/)) {
            return await (0, exports.update)(event);
        }
        else if (httpMethod === 'DELETE' &&
            pathParameters?.id &&
            path.match(/^\/courses\/[^\/]+$/)) {
            return await (0, exports.remove)(event);
        }
        return response.error(404, 'Route not found');
    }
    catch (error) {
        console.error('Error in courses handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};
exports.handler = handler;
const create = async (event) => {
    try {
        const data = JSON.parse(event.body || '{}');
        const { title, lectures, professorId, semester } = data;
        if (!title || !professorId || !semester) {
            return response.error(400, 'Missing required fields');
        }
        const course = {
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
    }
    catch (error) {
        console.error('Error creating course:', error);
        return response.error(500, 'Could not create course');
    }
};
exports.create = create;
const get = async (event) => {
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
    }
    catch (error) {
        console.error('Error getting course:', error);
        return response.error(500, 'Could not get course');
    }
};
exports.get = get;
const list = async () => {
    try {
        const courses = await dynamodb.scan({
            TableName: TABLE_NAME,
        });
        return response.success(courses);
    }
    catch (error) {
        console.error('Error listing courses:', error);
        return response.error(500, 'Could not list courses');
    }
};
exports.list = list;
const update = async (event) => {
    try {
        const { id } = event.pathParameters || {};
        const data = JSON.parse(event.body || '{}');
        if (!id) {
            return response.error(400, 'Missing course ID');
        }
        const { title, lectures, semester } = data;
        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};
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
    }
    catch (error) {
        console.error('Error updating course:', error);
        return response.error(500, 'Could not update course');
    }
};
exports.update = update;
const remove = async (event) => {
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
    }
    catch (error) {
        console.error('Error deleting course:', error);
        return response.error(500, 'Could not delete course');
    }
};
exports.remove = remove;
const listByProfessor = async (event) => {
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
    }
    catch (error) {
        console.error('Error listing courses by professor:', error);
        return response.error(500, 'Could not list courses by professor');
    }
};
exports.listByProfessor = listByProfessor;
//# sourceMappingURL=index.js.map