import { Request, Response } from 'express';
/**
 * Register a new user
 */
export declare function register(req: Request, res: Response): Promise<void>;
/**
 * Login user
 */
export declare function login(req: Request, res: Response): Promise<void>;
/**
 * Logout user
 */
export declare function logout(req: Request, res: Response): Promise<void>;
/**
 * Refresh access token
 */
export declare function refreshToken(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=authController.d.ts.map