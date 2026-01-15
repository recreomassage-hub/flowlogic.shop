import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MovementTestModel } from '../../db/models/MovementTest';

/**
 * Get all movement tests
 */
export async function getMovementTests(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const tests = await MovementTestModel.getAll();
    res.status(200).json({
      tests,
      count: tests.length,
    });
  } catch (error: any) {
    console.error('Error fetching movement tests:', error);
    res.status(500).json({ error: 'Failed to fetch movement tests', message: error.message });
  }
}

/**
 * Get movement test by ID
 */
export async function getMovementTest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { test_id } = req.params;
    if (!test_id) {
      res.status(400).json({ error: 'test_id is required' });
      return;
    }

    const test = await MovementTestModel.getById(parseInt(test_id, 10));
    if (!test) {
      res.status(404).json({ error: 'Movement test not found' });
      return;
    }

    res.status(200).json(test);
  } catch (error: any) {
    console.error('Error fetching movement test:', error);
    res.status(500).json({ error: 'Failed to fetch movement test', message: error.message });
  }
}

/**
 * Get movement tests by body region
 */
export async function getMovementTestsByBodyRegion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { body_region } = req.params;
    if (!body_region) {
      res.status(400).json({ error: 'body_region is required' });
      return;
    }

    const tests = await MovementTestModel.getByBodyRegion(body_region);
    res.status(200).json({
      tests,
      count: tests.length,
    });
  } catch (error: any) {
    console.error('Error fetching movement tests by body region:', error);
    res.status(500).json({ error: 'Failed to fetch movement tests', message: error.message });
  }
}
