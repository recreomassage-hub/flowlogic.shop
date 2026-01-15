import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as movementTestsController from '../controllers/movementTestsController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', movementTestsController.getMovementTests);
router.get('/body-region/:body_region', movementTestsController.getMovementTestsByBodyRegion);
router.get('/:test_id', movementTestsController.getMovementTest);

export default router;
