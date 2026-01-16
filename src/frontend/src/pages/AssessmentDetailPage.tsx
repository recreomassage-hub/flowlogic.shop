import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { assessmentsApi, Assessment } from '../api/assessments';
import { Card } from '../components/ui/Card/Card';
import { getErrorMessage } from '../api/types';

export function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAssessment = async () => {
      try {
        const data = await assessmentsApi.getAssessment(id);
        setAssessment(data);
      } catch (error) {
        console.error('Failed to fetch assessment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleExportPDF = async () => {
    if (!id || !assessment) return;

    setExporting(true);
    try {
      const blob = await assessmentsApi.exportAssessment(id);
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Empty PDF received');
      }
      
      // Check if blob is actually PDF
      const blobType = blob.type || 'application/pdf';
      if (!blobType.includes('pdf') && !blobType.includes('octet-stream')) {
        console.warn('Unexpected blob type:', blobType);
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date(assessment.created_at).toISOString().split('T')[0];
      const testNameSlug = assessment.test_name.toLowerCase().replace(/\s+/g, '-');
      link.download = `assessment-${testNameSlug}-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      const errorMessage = getErrorMessage(error);
      alert(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Assessment Details - Flow Logic</title>
        </Helmet>
        <div className="text-center py-12">Loading...</div>
      </>
    );
  }

  if (!assessment) {
    return (
      <>
        <Helmet>
          <title>Assessment Not Found - Flow Logic</title>
        </Helmet>
        <div className="text-center py-12">Assessment not found</div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{assessment.test_name} - Flow Logic</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{assessment.test_name}</h1>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="btn btn-secondary"
        >
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
      <Card>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Status</p>
          <p className="text-lg font-semibold capitalize">{assessment.status}</p>
        </div>
        {assessment.result && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-lg font-semibold capitalize">{assessment.result.score}</p>
          </div>
        )}
        {assessment.completed_at && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-lg">{new Date(assessment.completed_at).toLocaleString()}</p>
          </div>
        )}
        {assessment.feedback && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">Feedback</p>
            <p className="text-lg">{assessment.feedback}</p>
          </div>
        )}
      </Card>
    </div>
    </>
  );
}







