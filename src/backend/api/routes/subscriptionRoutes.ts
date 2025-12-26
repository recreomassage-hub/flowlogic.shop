import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as subscriptionController from '../controllers/subscriptionController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', subscriptionController.getCurrentSubscription);
router.post('/', subscriptionController.createSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);

export default router;


