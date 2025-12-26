import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Get current subscription
 */
export declare function getCurrentSubscription(req: AuthRequest, res: Response): Promise<void>;
/**
 * Create subscription (upgrade)
 */
export declare function createSubscription(req: AuthRequest, res: Response): Promise<void>;
/**
 * Cancel subscription
 */
export declare function cancelSubscription(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=subscriptionController.d.ts.map