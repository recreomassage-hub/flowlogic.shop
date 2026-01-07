import { useLocation, useNavigate } from 'react-router-dom';
import { VideoRecorder } from '../components/VideoRecorder/VideoRecorder';

export function AssessmentNewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Достаем ID и ссылку для загрузки, которые мы передали из AssessmentsPage
  const { assessmentId, uploadUrl } = location.state || {};

  if (!assessmentId || !uploadUrl) {
    // Если пользователь зашел на страницу напрямую, а не через кнопку
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Please start assessment from the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const handleUploadSuccess = () => {
    // Navigate to assessment detail page after successful upload
    navigate(`/assessments/${assessmentId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <VideoRecorder
          assessmentId={assessmentId}
          uploadUrl={uploadUrl}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
}

