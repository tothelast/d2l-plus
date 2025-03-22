const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Content-Type': 'application/json',
};

const respond = (statusCode, body) => ({
    statusCode,
    headers,
    body: JSON.stringify(body),
});

exports.handler = async (event) => {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
        return respond(200, {});
    }

    const { path, body } = event;
    let data;

    try {
        data = JSON.parse(body);
    } catch (error) {
        return respond(400, {
            error: 'Invalid request body',
            message: 'Request body must be valid JSON',
        });
    }

    try {
        switch (path) {
            case '/auth/register':
                return await handleRegister(data);
            case '/auth/login':
                return await handleLogin(data);
            case '/auth/verify':
                return await handleVerify(data);
            case '/auth/forgot-password':
                return await handleForgotPassword(data);
            case '/auth/reset-password':
                return await handleResetPassword(data);
            default:
                return respond(404, {
                    error: 'Not Found',
                    message: 'Requested endpoint does not exist',
                });
        }
    } catch (error) {
        console.error('Error:', error);
        return respond(500, {
            error: 'Internal Server Error',
            message:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'An unexpected error occurred',
        });
    }
};

async function handleRegister({ email, password }) {
    if (!email || !password) {
        return respond(400, {
            error: 'Bad Request',
            message: 'Email and password are required',
        });
    }

    const params = {
        ClientId: process.env.CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
            {
                Name: 'email',
                Value: email,
            },
        ],
    };

    try {
        await cognito.signUp(params).promise();
        return respond(200, {
            success: true,
            message: 'User registered successfully. Please check your email for verification code.',
            email: email,
        });
    } catch (error) {
        if (error.code === 'UsernameExistsException') {
            return respond(409, {
                error: 'Conflict',
                message: 'An account with this email already exists',
            });
        }
        return respond(400, {
            error: 'Registration Failed',
            message: error.message,
        });
    }
}

async function handleLogin({ email, password }) {
    if (!email || !password) {
        return respond(400, {
            error: 'Bad Request',
            message: 'Email and password are required',
        });
    }

    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    };

    try {
        const result = await cognito.initiateAuth(params).promise();
        return respond(200, {
            success: true,
            message: 'Login successful',
            tokens: {
                accessToken: result.AuthenticationResult.AccessToken,
                refreshToken: result.AuthenticationResult.RefreshToken,
                idToken: result.AuthenticationResult.IdToken,
                expiresIn: result.AuthenticationResult.ExpiresIn,
            },
        });
    } catch (error) {
        if (error.code === 'UserNotConfirmedException') {
            return respond(403, {
                error: 'Unconfirmed User',
                message: 'Please verify your email address',
            });
        }
        return respond(401, {
            error: 'Authentication Failed',
            message: 'Invalid email or password',
        });
    }
}

async function handleVerify({ email, code }) {
    if (!email || !code) {
        return respond(400, {
            error: 'Bad Request',
            message: 'Email and verification code are required',
        });
    }

    const params = {
        ClientId: process.env.CLIENT_ID,
        ConfirmationCode: code,
        Username: email,
    };

    try {
        await cognito.confirmSignUp(params).promise();
        return respond(200, {
            success: true,
            message: 'Email verified successfully',
        });
    } catch (error) {
        if (error.code === 'CodeMismatchException') {
            return respond(400, {
                error: 'Invalid Code',
                message: 'The verification code is incorrect',
            });
        }
        return respond(400, {
            error: 'Verification Failed',
            message: error.message,
        });
    }
}

async function handleForgotPassword({ email }) {
    if (!email) {
        return respond(400, {
            error: 'Bad Request',
            message: 'Email is required',
        });
    }

    const params = {
        ClientId: process.env.CLIENT_ID,
        Username: email,
    };

    try {
        await cognito.forgotPassword(params).promise();
        return respond(200, {
            success: true,
            message: 'Password reset code sent to email',
        });
    } catch (error) {
        if (error.code === 'UserNotFoundException') {
            // For security reasons, we don't want to reveal if a user exists
            return respond(200, {
                success: true,
                message: 'If an account exists with this email, a password reset code will be sent',
            });
        }
        return respond(400, {
            error: 'Reset Request Failed',
            message: error.message,
        });
    }
}

async function handleResetPassword({ email, code, newPassword }) {
    if (!email || !code || !newPassword) {
        return respond(400, {
            error: 'Bad Request',
            message: 'Email, code, and new password are required',
        });
    }

    const params = {
        ClientId: process.env.CLIENT_ID,
        ConfirmationCode: code,
        Password: newPassword,
        Username: email,
    };

    try {
        await cognito.confirmForgotPassword(params).promise();
        return respond(200, {
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        if (error.code === 'CodeMismatchException') {
            return respond(400, {
                error: 'Invalid Code',
                message: 'The reset code is incorrect',
            });
        }
        return respond(400, {
            error: 'Reset Failed',
            message: error.message,
        });
    }
}
