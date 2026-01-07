import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AssessmentModel, Assessment } from '../../db/models/Assessment';
import { UserModel } from '../../db/models/User';
import { getPresignedUrl, S3_CONFIG } from '../../config/s3';
import { generateAssessmentPDF } from '../../services/pdfService';
import { v4 as uuidv4 } from 'uuid';

// Test catalog (Elite catalog)
const TEST_CATALOG: Record<number, string> = {
  1: 'Overhead Squat',
  2: 'Y-Balance Test',
  3: 'Single Leg Squat',
  4: 'Functional Movement Screen',
  5: 'Shoulder Mobility',
  6: 'Hip Mobility',
  7: 'Ankle Mobility',
  8: 'Core Stability',
  9: 'Balance Test',
  10: 'Agility Test',
  11: 'Power Test',
  12: 'Endurance Test',
  13: 'Flexibility Test',
  14: 'Coordination Test',
  15: 'Reaction Time Test',
};

/**
 * Get list of assessments
 */
export async function getAssessments(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { month, test_id } = req.query;

    let assessments: Assessment[];

    if (month && typeof month === 'string') {
      // Filter by month
      assessments = await AssessmentModel.getByMonth(month);
    } else if (test_id && typeof test_id === 'string') {
      // Filter by test type
      const testIdNum = parseInt(test_id, 10);
      assessments = await AssessmentModel.getByTestType(testIdNum);
    } else {
      // Get all assessments for user
      assessments = await AssessmentModel.getByUserId(req.user.sub);
    }

    // Filter by user_id (for month and test_id queries)
    assessments = assessments.filter((a) => a.user_id === req.user!.sub);

    res.status(200).json({ assessments });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get assessments',
    });
  }
}

/**
 * Start new assessment (create and get presigned URL)
 */
export async function createAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    console.log('[createAssessment] Starting, user:', req.user?.sub);
    if (!req.user) {
      console.log('[createAssessment] No user found');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { test_id } = req.body;
    console.log('[createAssessment] test_id:', test_id);

    if (!test_id || typeof test_id !== 'number' || test_id < 1 || test_id > 15) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'test_id must be a number between 1 and 15',
      });
      return;
    }

    console.log('[createAssessment] Getting user:', req.user.sub);
    let user = await UserModel.getById(req.user.sub);
    
    // If user not found by ID, try to find by email (for legacy users)
    if (!user && req.user.email) {
      console.log('[createAssessment] User not found by ID, trying email:', req.user.email);
      user = await UserModel.getByEmail(req.user.email);
      
      // If found by email but user_id doesn't match, update user_id to match Cognito sub
      if (user && user.user_id !== req.user.sub) {
        console.log('[createAssessment] Updating user_id to match Cognito sub');
        // Note: This is a workaround. In production, you should migrate all users.
        // For now, we'll create a new user record with the correct user_id
        const newUser = await UserModel.create({
          user_id: req.user.sub,
          email: user.email,
          name: user.name,
          tier: user.tier,
          wellness_disclaimer_accepted: user.wellness_disclaimer_accepted,
          wellness_disclaimer_accepted_at: user.wellness_disclaimer_accepted_at,
        });
        user = newUser;
      }
    }
    
    // If still not found, create user from Cognito data
    if (!user) {
      console.log('[createAssessment] User not found, creating from Cognito data');
      user = await UserModel.create({
        user_id: req.user.sub,
        email: req.user.email,
        tier: 'free',
        wellness_disclaimer_accepted: false, // Will need to accept on next login
        wellness_disclaimer_accepted_at: new Date().toISOString(),
      });
      console.log('[createAssessment] User created:', user.user_id);
    } else {
      console.log('[createAssessment] User found:', user.user_id);
    }

    // Check tier limits (simplified - should check daily/monthly limits)
    // TODO: Implement proper limit checking using USER_LIMITS table

    const testName = TEST_CATALOG[test_id];
    if (!testName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid test_id',
      });
      return;
    }

    // Create assessment
    console.log('[createAssessment] Creating assessment...');
    const assessmentId = uuidv4();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const assessment = await AssessmentModel.create({
      user_id: user.user_id,
      assessment_id: assessmentId,
      test_id,
      test_name: testName,
      video_url: '', // Will be set after upload
      status: 'processing',
      attempt_number: 1, // TODO: Calculate from existing assessments
      month_key: monthKey,
    });

    console.log('[createAssessment] Assessment created:', assessment.assessment_id);
    
    // Generate presigned URL for video upload
    console.log('[createAssessment] Generating presigned URL...');
    const videoKey = `assessments/${user.user_id}/${assessmentId}/video.mp4`;
    const uploadUrl = await getPresignedUrl(videoKey, 'putObject', 3600); // 1 hour expiry
    console.log('[createAssessment] Presigned URL generated');

    // Update assessment with video URL placeholder
    console.log('[createAssessment] Updating assessment with video URL...');
    await AssessmentModel.update(user.user_id, assessmentId, {
      video_url: `s3://${S3_CONFIG.bucketName}/${videoKey}`,
    });
    console.log('[createAssessment] Assessment updated');

    console.log('[createAssessment] Sending response');
    res.status(201).json({
      assessment_id: assessment.assessment_id,
      upload_url: uploadUrl,
      expires_in: 3600,
    });
    console.log('[createAssessment] Response sent');
  } catch (error) {
    console.error('[createAssessment] ERROR:', error);
    console.error('[createAssessment] Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create assessment',
    });
  }
}

/**
 * Get assessment by ID
 */
export async function getAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { assessment_id } = req.params;

    if (!assessment_id) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'assessment_id is required',
      });
      return;
    }

    const assessment = await AssessmentModel.getById(req.user.sub, assessment_id);

    if (!assessment) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Assessment not found',
      });
      return;
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get assessment',
    });
  }
}

/**
 * Update assessment (mark video as uploaded, trigger processing)
 */
export async function updateAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { assessment_id } = req.params;
    const { video_uploaded } = req.body;

    if (!assessment_id) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'assessment_id is required',
      });
      return;
    }

    if (video_uploaded !== true) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'video_uploaded must be true',
      });
      return;
    }

    const assessment = await AssessmentModel.getById(req.user.sub, assessment_id);

    if (!assessment) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Assessment not found',
      });
      return;
    }

    // Update video URL and trigger processing
    const videoKey = `assessments/${req.user.sub}/${assessment_id}/video.mp4`;
    const videoUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${videoKey}`;

    const updated = await AssessmentModel.update(req.user.sub, assessment_id, {
      video_url: videoUrl,
      status: 'processing',
    });

    // TODO: Trigger MediaPipe processing via EventBridge/SQS

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update assessment',
    });
  }
}

/**
 * Export assessment as PDF
 */
export async function exportAssessment(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { assessment_id } = req.params;

    if (!assessment_id) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'assessment_id is required',
      });
      return;
    }

    // Get assessment
    const assessment = await AssessmentModel.getById(req.user.sub, assessment_id);

    if (!assessment) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Assessment not found',
      });
      return;
    }

    // Get user profile for name (optional)
    let user: { name?: string; email: string } | undefined;
    try {
      const userData = await UserModel.getById(req.user.sub);
      if (userData) {
        user = {
          name: userData.name,
          email: userData.email,
        };
      }
    } catch (error) {
      // User data not critical for PDF, continue without it
      console.warn('Failed to get user data for PDF:', error);
    }

    // Generate PDF
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateAssessmentPDF(assessment, user);
      
      // Validate PDF buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF is empty');
      }
      
      // Check PDF header (should start with %PDF)
      const pdfHeader = pdfBuffer.toString('latin1', 0, 4);
      if (pdfHeader !== '%PDF') {
        console.error('Invalid PDF header:', pdfHeader);
        throw new Error('Generated PDF is invalid');
      }
    } catch (error: any) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }

    // Generate filename
    const dateStr = assessment.created_at 
      ? new Date(assessment.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const testNameSlug = (assessment.test_name || 'assessment').toLowerCase().replace(/\s+/g, '-');
    const filename = `assessment-${testNameSlug}-${dateStr}.pdf`;

    // Set response headers
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    // Send PDF buffer
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Export assessment error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to export assessment',
    });
  }
}

