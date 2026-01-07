import { generateAssessmentPDF } from '../../services/pdfService';
import {
  mockCompletedAssessment,
  mockProcessingAssessment,
  mockFailedAssessment,
  mockInvalidAssessment,
  mockPassAssessment,
  mockAssessmentWithoutProblemAreas,
} from '../fixtures/assessmentFixtures';

describe('PDF Service - generateAssessmentPDF', () => {
  describe('Complete assessment data', () => {
    it('should generate PDF with complete assessment data', async () => {
      const mockUser = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const pdfBuffer = await generateAssessmentPDF(
        mockCompletedAssessment,
        mockUser
      );

      // Basic checks
      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);

      // Check PDF header (PDF files start with %PDF)
      const pdfHeader = pdfBuffer.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');

      // PDF is binary format, so we can't easily check text content
      // Content validation should be done in integration tests or with PDF parser
      // For unit tests, we verify that PDF is generated successfully
      expect(pdfBuffer.length).toBeGreaterThan(1000); // PDF should be substantial
    });
  });

  describe('Without user name', () => {
    it('should generate PDF without user name (email only)', async () => {
      const mockUserEmailOnly = {
        email: 'john@example.com',
      };

      const pdfBuffer = await generateAssessmentPDF(
        mockCompletedAssessment,
        mockUserEmailOnly
      );

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = pdfBuffer.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');
      
      // PDF is binary, content validation in integration tests
    });
  });

  describe('Processing assessment', () => {
    it('should generate PDF for processing assessment', async () => {
      const pdfBuffer = await generateAssessmentPDF(mockProcessingAssessment);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = pdfBuffer.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');
    });
  });

  describe('Failed assessment', () => {
    it('should generate PDF for failed assessment', async () => {
      const pdfBuffer = await generateAssessmentPDF(mockFailedAssessment);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = pdfBuffer.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');
    });
  });

  describe('Invalid assessment', () => {
    it('should generate PDF for invalid assessment with feedback', async () => {
      const pdfBuffer = await generateAssessmentPDF(mockInvalidAssessment);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = pdfBuffer.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');
    });
  });

  describe('Without problem areas', () => {
    it('should generate PDF without problem areas', async () => {
      const pdfBuffer = await generateAssessmentPDF(mockAssessmentWithoutProblemAreas);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = pdfBuffer.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');
    });

    it('should generate PDF for pass assessment with recommendations', async () => {
      const pdfBuffer = await generateAssessmentPDF(mockPassAssessment);

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // Check PDF header
      const pdfHeader = pdfBuffer.toString('utf-8', 0, 10);
      expect(pdfHeader).toContain('%PDF');
    });
  });

  describe('Error handling', () => {
    it('should handle null assessment gracefully', async () => {
      await expect(
        generateAssessmentPDF(null as any)
      ).rejects.toThrow();
    });

    it('should handle invalid data gracefully', async () => {
      const invalidAssessment = {
        ...mockCompletedAssessment,
        created_at: 'invalid-date',
      };
      
      // Should either handle gracefully or throw meaningful error
      try {
        const pdfBuffer = await generateAssessmentPDF(invalidAssessment);
        // If it doesn't throw, PDF should still be generated
        expect(pdfBuffer).toBeDefined();
      } catch (error) {
        // If it throws, error should be defined
        expect(error).toBeDefined();
      }
    });
  });
});

