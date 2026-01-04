import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.AWS_REGION || 'us-east-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID || '';
const clientId = process.env.COGNITO_CLIENT_ID || '';

export const cognitoClient = new CognitoIdentityProviderClient({ region });

export const COGNITO_CONFIG = {
  userPoolId,
  clientId,
  region,
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  accessTokenTTL: 15 * 60, // 15 minutes
  refreshTokenTTL: 30 * 24 * 60 * 60, // 30 days
} as const;







