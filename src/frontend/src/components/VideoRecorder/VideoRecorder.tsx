import { useEffect } from 'react';
import { useVideoRecorder } from '../../hooks/useVideoRecorder';
import { useBeforeUnload } from '../../hooks/useBeforeUnload';
import { CameraPreview } from './CameraPreview';
import { RecordingControls } from './RecordingControls';
import { RecordingTimer } from './RecordingTimer';
import { VideoPreview } from './VideoPreview';
import { UploadProgress } from './UploadProgress';
import { ErrorDisplay } from './ErrorDisplay';

interface VideoRecorderProps {
  assessmentId: string;
  uploadUrl: string;
  onUploadSuccess: () => void;
}

export function VideoRecorder({ assessmentId: _assessmentId, uploadUrl, onUploadSuccess }: VideoRecorderProps) {
  const {
    state,
    stream,
    videoBlob,
    videoUrl,
    duration,
    uploadProgress,
    validationResult,
    retryCount,
    requestCamera,
    startRecording,
    stopRecording,
    retryRecording,
    uploadVideo,
    error,
  } = useVideoRecorder();

  // Request camera access on mount (only once)
  useEffect(() => {
    console.log('[VideoRecorder] Component mounted, state:', state);
    // Request camera immediately on mount if in idle state
    if (state === 'idle') {
      console.log('[VideoRecorder] Requesting camera access...');
      requestCamera().catch((err) => {
        console.error('[VideoRecorder] Failed to request camera:', err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle success state
  useEffect(() => {
    if (state === 'success') {
      // Show success message briefly before navigating
      const timer = setTimeout(() => {
        onUploadSuccess();
      }, 1500); // 1.5 seconds delay to show success message

      return () => clearTimeout(timer);
    }
  }, [state, onUploadSuccess]);

  const isCameraVisible = state === 'ready' || state === 'recording';

  // Show warning before leaving page during recording or upload
  useBeforeUnload(
    state === 'recording' || state === 'uploading',
    'Recording/upload in progress. Are you sure you want to leave?'
  );

  return (
    <div className="space-y-4 sm:space-y-6" role="main" aria-label="Video recording interface">
      <div className="text-center px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Record Assessment Video</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Record a video of yourself performing the assessment test.
          Maximum duration: 45 seconds.
        </p>
      </div>

      {/* ARIA Live Region for status updates */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {state === 'requesting' && 'Requesting camera access'}
        {state === 'ready' && 'Camera ready. You can start recording'}
        {state === 'recording' && `Recording in progress. Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`}
        {state === 'stopped' && 'Recording stopped. Review your video'}
        {state === 'uploading' && `Uploading video. Progress: ${Math.round(uploadProgress)}%`}
        {state === 'success' && 'Video uploaded successfully'}
        {error && `Error: ${error}`}
      </div>

      {/* Camera Preview */}
      <CameraPreview stream={stream} isVisible={isCameraVisible} />

      {/* Recording Timer */}
      {state === 'recording' && <RecordingTimer duration={duration} />}

      {/* Video Preview (after recording) */}
      {state === 'stopped' && (
        <VideoPreview
          videoUrl={videoUrl}
          videoBlob={videoBlob}
          onRetry={retryRecording}
          onUpload={() => uploadVideo(uploadUrl)}
          validationErrors={validationResult?.errors || []}
        />
      )}

      {/* Upload Progress */}
      {state === 'uploading' && <UploadProgress progress={uploadProgress} />}

      {/* Success Message */}
      {state === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Video Uploaded Successfully!
          </h3>
          <p className="text-green-700">
            Redirecting to assessment details...
          </p>
        </div>
      )}

      {/* Recording Controls */}
      <RecordingControls
        state={state}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      {/* Error Display */}
      {error && state === 'error' && (
        <ErrorDisplay
          error={error}
          errorType={
            error.includes('Camera') || error.includes('camera')
              ? 'camera'
              : error.includes('Recording') || error.includes('recording')
              ? 'recording'
              : error.includes('Upload') || error.includes('upload')
              ? 'upload'
              : error.includes('Validation') || error.includes('validation') || validationResult?.errors.length
              ? 'validation'
              : 'general'
          }
          retryCount={retryCount}
          maxRetries={3}
          onRetry={
            error.includes('Upload') || error.includes('upload')
              ? () => {
                  // Retry upload - error state will be reset in uploadVideo
                  uploadVideo(uploadUrl);
                }
              : error.includes('Camera') || error.includes('camera')
              ? requestCamera
              : error.includes('Recording') || error.includes('recording')
              ? startRecording
              : undefined
          }
          showCancel={true}
        />
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 text-center">
          State: <span className="font-mono">{state}</span>
        </div>
      )}
    </div>
  );
}
