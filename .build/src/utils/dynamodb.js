"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = exports.query = exports.remove = exports.update = exports.get = exports.create = void 0;
// Use AWS SDK v3 which is available in Lambda runtime
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({});
const dynamodb = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const create = async (params) => {
    try {
        await dynamodb.send(new lib_dynamodb_1.PutCommand(params));
        return { success: true };
    }
    catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
};
exports.create = create;
const get = async (params) => {
    try {
        const result = await dynamodb.send(new lib_dynamodb_1.GetCommand(params));
        return result.Item;
    }
    catch (error) {
        console.error('Error getting item:', error);
        throw error;
    }
};
exports.get = get;
const update = async (params) => {
    try {
        const result = await dynamodb.send(new lib_dynamodb_1.UpdateCommand(params));
        return result;
    }
    catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
};
exports.update = update;
const remove = async (params) => {
    try {
        await dynamodb.send(new lib_dynamodb_1.DeleteCommand(params));
        return { success: true };
    }
    catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};
exports.remove = remove;
const query = async (params) => {
    try {
        const result = await dynamodb.send(new lib_dynamodb_1.QueryCommand(params));
        return result.Items;
    }
    catch (error) {
        console.error('Error querying items:', error);
        throw error;
    }
};
exports.query = query;
const scan = async (params) => {
    try {
        const result = await dynamodb.send(new lib_dynamodb_1.ScanCommand(params));
        return result.Items;
    }
    catch (error) {
        console.error('Error scanning items:', error);
        throw error;
    }
};
exports.scan = scan;
//# sourceMappingURL=dynamodb.js.map