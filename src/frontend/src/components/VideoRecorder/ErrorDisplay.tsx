import { useNavigate } from 'react-router-dom';

interface ErrorDisplayProps {
  error: string | null;
  errorType?: 'camera' | 'recording' | 'upload' | 'validation' | 'general';
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  showCancel?: boolean;
}

export function ErrorDisplay({
  error,
  errorType = 'general',
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  showCancel = true,
}: ErrorDisplayProps) {
  const navigate = useNavigate();

  if (!error) {
    return null;
  }

  const canRetry = onRetry && retryCount < maxRetries;
  const maxRetriesReached = retryCount >= maxRetries;

  const getErrorIcon = () => {
    switch (errorType) {
      case 'camera':
        return '📷';
      case 'recording':
        return '🎥';
      case 'upload':
        return '📤';
      case 'validation':
        return '⚠️';
      default:
        return '❌';
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case 'camera':
        return 'Camera Error';
      case 'recording':
        return 'Recording Error';
      case 'upload':
        return 'Upload Error';
      case 'validation':
        return 'Validation Error';
      default:
        return 'Error';
    }
  };

  const handleCancel = () => {
    navigate('/assessments');
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mx-4 sm:mx-0">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{getErrorIcon()}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {getErrorTitle()}
          </h3>
          <p className="text-red-700 mb-4">{error}</p>

          {/* Retry count info */}
          {errorType === 'upload' && retryCount > 0 && (
            <p className="text-sm text-red-600 mb-4">
              Attempt {retryCount} of {maxRetries}
            </p>
          )}

          {/* Max retries reached message */}
          {maxRetriesReached && errorType === 'upload' && (
            <p className="text-sm text-red-600 mb-4 font-semibold">
              Maximum retry attempts reached. Please record again.
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry && (
              <button
                onClick={onRetry}
                className="btn btn-primary w-full sm:w-auto min-h-[44px]"
                aria-label="Retry"
              >
                Retry
              </button>
            )}
            {showCancel && (
              <button
                onClick={handleCancel}
                className="btn btn-secondary w-full sm:w-auto min-h-[44px]"
                aria-label="Cancel and return to assessments"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Help links for camera errors */}
          {errorType === 'camera' && (
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-sm text-red-600 mb-2">
                Need help enabling your camera?
              </p>
              <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/2693767"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-red-800"
                  >
                    Chrome instructions
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/how-manage-your-camera-and-microphone-permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-red-800"
                  >
                    Firefox instructions
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-red-800"
                  >
                    Safari instructions
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

