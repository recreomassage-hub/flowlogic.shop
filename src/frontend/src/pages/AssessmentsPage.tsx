import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assessmentsApi, Assessment } from '../api/assessments';

export function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleCreateAssessment = async () => {
    try {
      // 1. Создаем ассесмент на бэкенде (test_id: 1 для примера)
      const data = await assessmentsApi.createAssessment({ test_id: 1 });
      
      // 2. Переходим на страницу записи видео, передавая полученный ID и URL для загрузки
      // Важно: ваша страница /assessments/new должна уметь принимать эти данные
      navigate('/assessments/new', { 
        state: { 
          assessmentId: data.assessment_id, 
          uploadUrl: data.upload_url 
        } 
      });
    } catch (error) {
      console.error('Failed to create assessment:', error);
      alert('Could not start assessment. Check console for details.');
    }
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await assessmentsApi.getAssessments();
        setAssessments(data);
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assessments</h1>
        <button onClick={handleCreateAssessment} className="btn btn-primary">
          Start New Assessment
        </button>
      </div>
      {assessments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No assessments yet.</p>
          <button onClick={handleCreateAssessment} className="btn btn-primary">
            Start Your First Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <Link
              key={assessment.assessment_id}
              to={`/assessments/${assessment.assessment_id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{assessment.test_name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                Status: <span className="capitalize">{assessment.status}</span>
              </p>
              <p className="text-sm text-gray-600">
                Created: {new Date(assessment.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}







