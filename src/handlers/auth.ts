import { APIGatewayProxyHandler } from 'aws-lambda';
import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    ConfirmSignUpCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';
import * as response from '../utils/response';
import * as dynamodb from '../utils/dynamodb';

const cognito = new CognitoIdentityProviderClient({ region: 'us-east-1' });
const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const USERS_TABLE = process.env.USERS_TABLE || 'd2l-plus-auth-users';

interface CognitoError {
    code?: string;
    message: string;
    name: string;
}

// Simple ID generator function that doesn't require uuid
function generateId(): string {
    return `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { path, httpMethod, body } = event;
        const data = JSON.parse(body || '{}');

        switch (`${httpMethod} ${path}`) {
            case 'POST /auth/register':
                return handleRegister(data);
            case 'POST /auth/login':
                return handleLogin(data);
            case 'POST /auth/verify':
                return handleVerify(data);
            case 'POST /auth/forgot-password':
                return handleForgotPassword(data);
            case 'POST /auth/reset-password':
                return handleResetPassword(data);
            default:
                return response.error(404, 'Route not found');
        }
    } catch (error) {
        const cognitoError = error as CognitoError;
        console.error('Auth error:', cognitoError);
        return response.error(500, cognitoError.message || 'Internal server error');
    }
};

async function handleRegister(data: any) {
    const { email, password, firstName, lastName, role } = data;

    if (!email || !password) {
        return response.error(400, 'Email and password are required');
    }

    try {
        // Register user in Cognito
        const command = new SignUpCommand({
            ClientId: CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
            ],
        });

        await cognito.send(command);

        // Create user in DynamoDB
        const userId = generateId();
        const user = {
            id: userId,
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            role: role || 'student', // Default role is student
            createdAt: new Date().toISOString(),
        };

        try {
            await dynamodb.create({
                TableName: USERS_TABLE,
                Item: user,
            });
            console.log(`User ${userId} added to DynamoDB`);
        } catch (dbError) {
            console.error('Error adding user to DynamoDB:', dbError);
            // We don't want to fail the registration if DB insert fails
            // User can still authenticate with Cognito
        }

        return response.success({
            message: 'User registered successfully. Please check your email for verification code.',
            userId, // Return the user ID for reference
        });
    } catch (error) {
        const cognitoError = error as CognitoError;
        console.error('Registration error:', cognitoError);
        return response.error(400, cognitoError.message || 'Could not register user');
    }
}

async function handleLogin(data: any) {
    const { email, password } = data;

    if (!email || !password) {
        return response.error(400, 'Email and password are required');
    }

    try {
        const command = new InitiateAuthCommand({
            AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        });

        await cognito.send(command);

        // Get user from DynamoDB to retrieve user ID
        try {
            const users = await dynamodb.query({
                TableName: USERS_TABLE,
                IndexName: 'EmailIndex',
                KeyConditionExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': email,
                },
            });

            const user = users && users.length > 0 ? users[0] : null;

            return response.success({
                message: 'Login successful',
                email: email,
                authenticated: true,
                userId: user ? user.id : null,
                firstName: user ? user.firstName : '',
                lastName: user ? user.lastName : '',
                role: user ? user.role : 'student',
            });
        } catch (dbError) {
            console.error('Error retrieving user from DynamoDB:', dbError);
            // If we can't get the user ID, still return successful login but without user ID
            return response.success({
                message: 'Login successful',
                email: email,
                authenticated: true,
            });
        }
    } catch (error) {
        const cognitoError = error as CognitoError;
        console.error('Login error:', cognitoError);
        return response.error(401, cognitoError.message || 'Invalid credentials');
    }
}

async function handleVerify(data: any) {
    const { email, code } = data;

    if (!email || !code) {
        return response.error(400, 'Email and verification code are required');
    }

    try {
        const command = new ConfirmSignUpCommand({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
        });

        await cognito.send(command);

        return response.success({
            message: 'Email verified successfully',
        });
    } catch (error) {
        const cognitoError = error as CognitoError;
        console.error('Verification error:', cognitoError);
        return response.error(400, cognitoError.message || 'Could not verify email');
    }
}

async function handleForgotPassword(data: any) {
    const { email } = data;

    if (!email) {
        return response.error(400, 'Email is required');
    }

    try {
        const command = new ForgotPasswordCommand({
            ClientId: CLIENT_ID,
            Username: email,
        });

        await cognito.send(command);

        return response.success({
            message: 'Password reset code sent to email',
        });
    } catch (error) {
        const cognitoError = error as CognitoError;
        console.error('Forgot password error:', cognitoError);
        return response.error(
            400,
            cognitoError.message || 'Could not process forgot password request'
        );
    }
}

async function handleResetPassword(data: any) {
    const { email, code, newPassword } = data;

    if (!email || !code || !newPassword) {
        return response.error(400, 'Email, code, and new password are required');
    }

    try {
        const command = new ConfirmForgotPasswordCommand({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
        });

        await cognito.send(command);

        return response.success({
            message: 'Password reset successfully',
        });
    } catch (error) {
        const cognitoError = error as CognitoError;
        console.error('Reset password error:', cognitoError);
        return response.error(400, cognitoError.message || 'Could not reset password');
    }
}
