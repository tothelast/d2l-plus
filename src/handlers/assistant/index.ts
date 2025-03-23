import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as response from '../../utils/response';
import * as bedrock from '../../utils/bedrock';
import { gatherUserContextData } from '../../utils/userDataService';
import { BedrockModelSummary } from '../../types';

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const { path, httpMethod } = event;

        // Handle the request based on the HTTP method and path
        if (httpMethod === 'POST' && path === '/assistant/chat') {
            return await chat(event);
        } else if (httpMethod === 'GET' && path === '/assistant/models') {
            return await listModels();
        }

        return response.error(404, 'Route not found');
    } catch (error) {
        console.error('Error in assistant handler:', error);
        return response.error(500, 'An unexpected error occurred');
    }
};

/**
 * Handle chat requests to the AI assistant
 */
export const chat = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const data = JSON.parse(event.body || '{}');
        const { prompt, userId } = data;

        // Support both prompt directly or extracting from messages array
        const userPrompt =
            prompt ||
            (data.messages?.length > 0
                ? data.messages.find((m: { role: string; content: string }) => m.role === 'user')
                      ?.content
                : '');

        if (!userPrompt || !userId) {
            return response.error(400, 'Missing required fields: prompt and userId are required');
        }

        // Gather context data for the user from DynamoDB
        const contextData = await gatherUserContextData(userId);

        // Generate response using AWS Bedrock
        const result = await bedrock.generateResponse(userPrompt, contextData);

        return response.success({
            message: result.response,
            usage: result.usage,
        });
    } catch (error: unknown) {
        console.error('Error processing chat request:', error);

        // Check for specific error types to provide better feedback
        if (error instanceof Error && error.message === 'User not found') {
            return response.error(404, 'User not found');
        }

        return response.error(500, 'Could not generate assistant response');
    }
};

/**
 * List available AI models from AWS Bedrock
 */
export const listModels = async (): Promise<APIGatewayProxyResult> => {
    try {
        const models = await bedrock.listFoundationModels();

        // Filter to only include active models
        const activeModels = models.filter(
            (model: BedrockModelSummary) => model.modelLifecycle?.status === 'ACTIVE'
        );

        return response.success({
            models: activeModels.map((model: BedrockModelSummary) => ({
                id: model.modelId,
                name: model.modelName,
                provider: model.providerName,
            })),
        });
    } catch (error) {
        console.error('Error listing models:', error);
        return response.error(500, 'Could not list available models');
    }
};
