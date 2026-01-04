import { useLocation } from 'react-router-dom';

export function AssessmentNewPage() {
  const location = useLocation();
  // Достаем ID и ссылку для загрузки, которые мы передали из AssessmentsPage
  const { assessmentId, uploadUrl } = location.state || {};

  if (!assessmentId) {
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

  // Далее используем uploadUrl для отправки видео в S3 после записи
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <h1 className="text-3xl font-bold mb-4">New Assessment</h1>
        <div className="space-y-4">
          <p className="text-gray-600">
            <strong>Assessment ID:</strong> {assessmentId}
          </p>
          {uploadUrl && (
            <p className="text-gray-600">
              <strong>Upload URL:</strong> {uploadUrl.substring(0, 50)}...
            </p>
          )}
          <p className="text-gray-600">
            Video recording functionality will be implemented here.
            Use the uploadUrl to upload the video to S3 after recording.
          </p>
        </div>
      </div>
    </div>
  );
}

