import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as assessmentController from '../controllers/assessmentController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', assessmentController.getAssessments);
router.post('/', assessmentController.createAssessment);
router.get('/:assessment_id', assessmentController.getAssessment);
router.put('/:assessment_id', assessmentController.updateAssessment);

export default router;

