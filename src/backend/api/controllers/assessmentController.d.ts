import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Get list of assessments
 */
export declare function getAssessments(req: AuthRequest, res: Response): Promise<void>;
/**
 * Start new assessment (create and get presigned URL)
 */
export declare function createAssessment(req: AuthRequest, res: Response): Promise<void>;
/**
 * Get assessment by ID
 */
export declare function getAssessment(req: AuthRequest, res: Response): Promise<void>;
/**
 * Update assessment (mark video as uploaded, trigger processing)
 */
export declare function updateAssessment(req: AuthRequest, res: Response): Promise<void>;
//# sourceMappingURL=assessmentController.d.ts.map