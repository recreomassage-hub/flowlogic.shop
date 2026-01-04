import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assessmentsApi, Assessment } from '../api/assessments';

export function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!assessment) {
    return <div className="text-center py-12">Assessment not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{assessment.test_name}</h1>
      <div className="card">
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
      </div>
    </div>
  );
}







