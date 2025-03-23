// Use AWS SDK v3 which is available in Lambda runtime
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

export const create = async (params: any) => {
    try {
        await dynamodb.send(new PutCommand(params));
        return { success: true };
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
};

export const get = async (params: any) => {
    try {
        const result = await dynamodb.send(new GetCommand(params));
        return result.Item;
    } catch (error) {
        console.error('Error getting item:', error);
        throw error;
    }
};

export const update = async (params: any) => {
    try {
        const result = await dynamodb.send(new UpdateCommand(params));
        return result;
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
};

export const remove = async (params: any) => {
    try {
        await dynamodb.send(new DeleteCommand(params));
        return { success: true };
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};

export const query = async (params: any) => {
    try {
        const result = await dynamodb.send(new QueryCommand(params));
        return result.Items;
    } catch (error) {
        console.error('Error querying items:', error);
        throw error;
    }
};

export const scan = async (params: any) => {
    try {
        const result = await dynamodb.send(new ScanCommand(params));
        return result.Items;
    } catch (error) {
        console.error('Error scanning items:', error);
        throw error;
    }
};
