'use strict';
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      },
                  };
              }
              Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', { enumerable: true, value: v });
          }
        : function (o, v) {
              o['default'] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    (function () {
        var ownKeys = function (o) {
            ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                    var ar = [];
                    for (var k in o)
                        if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
                    return ar;
                };
            return ownKeys(o);
        };
        return function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                    if (k[i] !== 'default') __createBinding(result, mod, k[i]);
            __setModuleDefault(result, mod);
            return result;
        };
    })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require('@aws-sdk/client-cognito-identity-provider');
const response = __importStar(require('../utils/response'));
const dynamodb = __importStar(require('../utils/dynamodb'));
const cognito = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
    region: 'us-east-1',
});
const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const USERS_TABLE = process.env.USERS_TABLE || 'd2l-plus-auth-users';
// Simple ID generator function that doesn't require uuid
function generateId() {
    return 'user-'.concat(Date.now(), '-').concat(Math.floor(Math.random() * 1000));
}
const handler = async (event) => {
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
        const cognitoError = error;
        console.error('Auth error:', cognitoError);
        return response.error(500, cognitoError.message || 'Internal server error');
    }
};
exports.handler = handler;
async function handleRegister(data) {
    return __awaiter(this, void 0, void 0, function () {
        var email,
            password,
            firstName,
            lastName,
            role,
            command,
            userId,
            user,
            _a,
            error_1,
            cognitoError;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (email = data.email),
                        (password = data.password),
                        (firstName = data.firstName),
                        (lastName = data.lastName),
                        (role = data.role);
                    if (!email || !password) {
                        return [
                            2 /*return*/,
                            response.error(400, 'Email and password are required'),
                        ];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    command = new client_cognito_identity_provider_1.SignUpCommand({
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
                    return [4 /*yield*/, cognito.send(command)];
                case 2:
                    _b.sent();
                    userId = generateId();
                    user = {
                        id: userId,
                        email: email,
                        firstName: firstName || '',
                        lastName: lastName || '',
                        role: role || 'student',
                        createdAt: new Date().toISOString(),
                    };
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [
                        4 /*yield*/,
                        dynamodb.create({
                            TableName: USERS_TABLE,
                            Item: user,
                        }),
                    ];
                case 4:
                    _b.sent();
                    console.log('User '.concat(userId, ' added to DynamoDB'));
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    console.error('Error adding user to DynamoDB:', _a);
                    return [3 /*break*/, 6];
                case 6:
                    return [
                        2 /*return*/,
                        response.success({
                            message:
                                'User registered successfully. Please check your email for verification code.',
                            userId: userId,
                        }),
                    ];
                case 7:
                    error_1 = _b.sent();
                    cognitoError = error_1;
                    console.error('Registration error:', cognitoError);
                    return [
                        2 /*return*/,
                        response.error(400, cognitoError.message || 'Could not register user'),
                    ];
            }
        });
    });
}
async function handleLogin(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = data;
        if (!email || !password) {
            return response.error(400, 'Email and password are required');
        }
        try {
            const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
                AuthFlow: client_cognito_identity_provider_1.AuthFlowType.USER_PASSWORD_AUTH,
                ClientId: CLIENT_ID,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password,
                },
            });
            yield cognito.send(command);

            // Get user from DynamoDB to retrieve user ID
            try {
                const users = yield dynamodb.query({
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
            const cognitoError = error;
            console.error('Login error:', cognitoError);
            return response.error(401, cognitoError.message || 'Invalid credentials');
        }
    });
}
async function handleVerify(data) {
    const { email, code } = data;
    if (!email || !code) {
        return response.error(400, 'Email and verification code are required');
    }
    try {
        const command = new client_cognito_identity_provider_1.ConfirmSignUpCommand({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
        });
        await cognito.send(command);
        return response.success({
            message: 'Email verified successfully',
        });
    } catch (error) {
        const cognitoError = error;
        console.error('Verification error:', cognitoError);
        return response.error(400, cognitoError.message || 'Could not verify email');
    }
}
async function handleForgotPassword(data) {
    const { email } = data;
    if (!email) {
        return response.error(400, 'Email is required');
    }
    try {
        const command = new client_cognito_identity_provider_1.ForgotPasswordCommand({
            ClientId: CLIENT_ID,
            Username: email,
        });
        await cognito.send(command);
        return response.success({
            message: 'Password reset code sent to email',
        });
    } catch (error) {
        const cognitoError = error;
        console.error('Forgot password error:', cognitoError);
        return response.error(
            400,
            cognitoError.message || 'Could not process forgot password request'
        );
    }
}
async function handleResetPassword(data) {
    const { email, code, newPassword } = data;
    if (!email || !code || !newPassword) {
        return response.error(400, 'Email, code, and new password are required');
    }
    try {
        const command = new client_cognito_identity_provider_1.ConfirmForgotPasswordCommand({
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
        const cognitoError = error;
        console.error('Reset password error:', cognitoError);
        return response.error(400, cognitoError.message || 'Could not reset password');
    }
}
//# sourceMappingURL=auth.js.map
