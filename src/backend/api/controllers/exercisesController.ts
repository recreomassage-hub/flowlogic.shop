import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ExerciseModel } from '../../db/models/Exercise';

/**
 * Get all exercises
 */
export async function getExercises(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const exercises = await ExerciseModel.getAll();
    res.status(200).json({
      exercises,
      count: exercises.length,
    });
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises', message: error.message });
  }
}

/**
 * Get exercise by ID
 */
export async function getExercise(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { exercise_id } = req.params;
    if (!exercise_id) {
      res.status(400).json({ error: 'exercise_id is required' });
      return;
    }

    const exercise = await ExerciseModel.getById(exercise_id);
    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }

    res.status(200).json(exercise);
  } catch (error: any) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise', message: error.message });
  }
}

/**
 * Get exercises by target area
 */
export async function getExercisesByTargetArea(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { target_area } = req.params;
    if (!target_area) {
      res.status(400).json({ error: 'target_area is required' });
      return;
    }

    const exercises = await ExerciseModel.getByTargetArea(target_area);
    res.status(200).json({
      exercises,
      count: exercises.length,
    });
  } catch (error: any) {
    console.error('Error fetching exercises by target area:', error);
    res.status(500).json({ error: 'Failed to fetch exercises', message: error.message });
  }
}
