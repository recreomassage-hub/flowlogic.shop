import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/me', userController.getCurrentUser);
router.patch('/me', userController.updateCurrentUser);

export default router;


