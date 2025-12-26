"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_CONFIG = exports.COGNITO_CONFIG = exports.cognitoClient = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const region = process.env.AWS_REGION || 'us-east-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID || '';
const clientId = process.env.COGNITO_CLIENT_ID || '';
exports.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({ region });
exports.COGNITO_CONFIG = {
    userPoolId,
    clientId,
    region,
};
// JWT Configuration
exports.JWT_CONFIG = {
    accessTokenTTL: 15 * 60, // 15 minutes
    refreshTokenTTL: 30 * 24 * 60 * 60, // 30 days
};
//# sourceMappingURL=cognito.js.map