import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import { BedrockModelSummary, BedrockResponse, UserContextData } from '../types';

// Initialize the Bedrock clients
const runtimeClient = new BedrockRuntimeClient({ region: 'us-east-1' });
const bedrockClient = new BedrockClient({ region: 'us-east-1' });

// Using Amazon's Titan model which may have different permission requirements
// As it's an Amazon-owned model
const DEFAULT_MODEL_ID = 'amazon.titan-text-express-v1';

/**
 * Get available foundation models from AWS Bedrock
 */
export const listFoundationModels = async (): Promise<BedrockModelSummary[]> => {
    try {
        const command = new ListFoundationModelsCommand({});
        const response = await bedrockClient.send(command);
        return response.modelSummaries as BedrockModelSummary[];
    } catch (error) {
        console.error('Error listing foundation models:', error);
        throw error;
    }
};

/**
 * Generate a response using AWS Bedrock's Titan model
 *
 * @param prompt The user's question or prompt
 * @param contextData The context data from DynamoDB to be used by the model
 */
export const generateResponse = async (
    prompt: string,
    contextData: UserContextData
): Promise<BedrockResponse> => {
    try {
        // Prepare context for the AI to understand the user's data
        const formattedContext = JSON.stringify(contextData, null, 2);

        // System prompt (explaining how to use the data)
        const systemPrompt = `You are an AI assistant for a university learning management system. You have access to the following data about the student. Use this information to provide accurate and personalized responses to their questions. Only reference information that is present in the provided data. If you don't know something, say so. Don't make up information that isn't in the data. Here is the student's data (in JSON format): ${formattedContext}`;

        // Combine the system prompt and user prompt into a single input for Titan
        // Avoid adding explicit "User question:" and "Assistant:" prefixes to prevent them from showing in responses
        const fullPrompt = `${systemPrompt}\n\nThe user says: ${prompt}\n\nRespond directly without repeating the user's query:`;

        // Prepare payload for Titan model (different format than Claude)
        const payload = {
            inputText: fullPrompt,
            textGenerationConfig: {
                maxTokenCount: 2000,
                temperature: 0.7,
                topP: 0.9,
            },
        };

        // Invoke the Bedrock model
        const response = await runtimeClient.send(
            new InvokeModelCommand({
                contentType: 'application/json',
                body: JSON.stringify(payload),
                modelId: DEFAULT_MODEL_ID,
            })
        );

        // Parse and return the response
        const decodedResponseBody = new TextDecoder().decode(response.body);
        const responseBody = JSON.parse(decodedResponseBody);

        // Titan has a different response format
        return {
            response:
                responseBody.results?.[0]?.outputText ||
                responseBody.outputText ||
                'No response generated',
            usage: { input_tokens: 0, output_tokens: 0 }, // Titan doesn't provide token counts
        };
    } catch (error) {
        console.error('Error generating Bedrock response:', error);
        throw error;
    }
};
