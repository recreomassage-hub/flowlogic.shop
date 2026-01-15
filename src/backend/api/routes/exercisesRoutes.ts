import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as exercisesController from '../controllers/exercisesController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', exercisesController.getExercises);
router.get('/target-area/:target_area', exercisesController.getExercisesByTargetArea);
router.get('/:exercise_id', exercisesController.getExercise);

export default router;
