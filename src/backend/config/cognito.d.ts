import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
export declare const cognitoClient: CognitoIdentityProviderClient;
export declare const COGNITO_CONFIG: {
    readonly userPoolId: string;
    readonly clientId: string;
    readonly region: string;
};
export declare const JWT_CONFIG: {
    readonly accessTokenTTL: number;
    readonly refreshTokenTTL: number;
};
//# sourceMappingURL=cognito.d.ts.map