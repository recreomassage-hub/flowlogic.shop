import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        sub: string;
        email: string;
        'cognito:username': string;
    };
}
/**
 * Middleware to verify JWT token from Cognito
 */
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware to check user tier
 */
export declare function requireTier(allowedTiers: string[]): (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map