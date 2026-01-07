import PDFDocument from 'pdfkit';
import { Assessment } from '../db/models/Assessment';

interface UserInfo {
  name?: string;
  email: string;
}

/**
 * Generate PDF report for assessment
 */
export async function generateAssessmentPDF(
  assessment: Assessment,
  user?: UserInfo
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 72, // 20mm
          bottom: 72,
          left: 72,
          right: 72,
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on('error', (error) => {
        reject(error);
      });

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Flow Logic', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(16).font('Helvetica').text('Assessment Report', { align: 'center' });
      doc.moveDown(1);

      // Assessment Info
      doc.fontSize(14).font('Helvetica-Bold').text('Assessment Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Test: ${assessment.test_name || 'Unknown Test'}`);
      doc.text(`Date: ${assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : 'N/A'}`);
      if (user?.name) {
        doc.text(`User: ${user.name}`);
      } else if (user?.email) {
        // Show email without domain for privacy
        const emailParts = user.email.split('@');
        doc.text(`User: ${emailParts[0]}@***`);
      }
      doc.text(`Status: ${(assessment.status || 'unknown').toUpperCase()}`);
      doc.moveDown(1);

      // Results Section
      if (assessment.result && assessment.result.score && assessment.result.confidence !== undefined) {
        doc.fontSize(14).font('Helvetica-Bold').text('Results', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Overall Score: ${assessment.result.score.toUpperCase()}`);
        doc.text(`Confidence: ${Math.round((assessment.result.confidence || 0) * 100)}%`);
        
        if (assessment.quality_score !== undefined) {
          doc.text(`Quality Score: ${Math.round(assessment.quality_score * 100)}%`);
        }
        if (assessment.confidence_avg !== undefined) {
          doc.text(`Average Confidence: ${Math.round(assessment.confidence_avg * 100)}%`);
        }
        if (assessment.motion_variance !== undefined) {
          doc.text(`Motion Variance: ${Math.round(assessment.motion_variance * 100)}%`);
        }
        doc.moveDown(1);

        // Problem Areas
        if (assessment.result.problem_areas && assessment.result.problem_areas.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('Problem Areas', { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(12).font('Helvetica');
          assessment.result.problem_areas.forEach((area) => {
            doc.text(`• ${area}`);
          });
          doc.moveDown(1);
        }
      } else {
        // No results yet
        doc.fontSize(14).font('Helvetica-Bold').text('Results', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        if (assessment.status === 'processing') {
          doc.text('Results are being processed. Please check back later.');
        } else if (assessment.status === 'failed') {
          doc.text('Assessment failed. Please try again.');
        } else if (assessment.status === 'invalid') {
          doc.text(assessment.feedback || 'Assessment is invalid.');
        } else {
          doc.text('Results are not available yet.');
        }
        doc.moveDown(1);
      }

      // Recommendations Section
      doc.fontSize(14).font('Helvetica-Bold').text('Recommendations', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      
      if (assessment.result?.problem_areas && assessment.result.problem_areas.length > 0) {
        doc.text('Based on the assessment results, consider the following:');
        doc.moveDown(0.3);
        doc.text('• Focus on exercises targeting the identified problem areas');
        doc.text('• Consult with a fitness professional for personalized guidance');
        doc.text('• Follow a structured training plan to address movement limitations');
        doc.text('• Re-assess periodically to track progress');
      } else if (assessment.result?.score === 'pass') {
        doc.text('Great job! Your movement quality is good.');
        doc.moveDown(0.3);
        doc.text('• Continue with your current routine');
        doc.text('• Maintain regular assessments to track progress');
        doc.text('• Consider advanced training to further improve');
      } else {
        doc.text('General recommendations:');
        doc.moveDown(0.3);
        doc.text('• Complete the assessment to receive personalized recommendations');
        doc.text('• Follow a balanced exercise routine');
        doc.text('• Consult with a fitness professional if needed');
      }
      doc.moveDown(1);

      // Footer
      doc.fontSize(10).font('Helvetica').text(
        'This is a wellness assessment, not a medical diagnosis. Consult with healthcare professionals for medical advice.',
        { align: 'center' }
      );
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text('Flow Logic - flowlogic.shop', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

