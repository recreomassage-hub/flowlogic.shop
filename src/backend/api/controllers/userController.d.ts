import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Get current user
 */
export declare function getCurrentUser(req: AuthRequest, res: Response): Promise<void>;
/**
 * Update current user
 */
export declare function updateCurrentUser(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=userController.d.ts.map