import { RecordingState } from '../../hooks/useVideoRecorder';

interface RecordingControlsProps {
  state: RecordingState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  state,
  onStartRecording,
  onStopRecording,
  disabled = false,
}: RecordingControlsProps) {
  const showStartButton = state === 'idle' || state === 'ready';
  const showStopButton = state === 'recording';
  const isRequesting = state === 'requesting';

  if (isRequesting) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Requesting camera access...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
      {showStartButton && (
        <button
          onClick={onStartRecording}
          onKeyDown={(e) => {
            // Support Enter and Space keys
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled && state === 'ready') {
                onStartRecording();
              }
            }
          }}
          disabled={disabled || state !== 'ready'}
          className="btn btn-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full sm:w-auto min-h-[44px]"
          aria-label="Start video recording. Press Enter or Space to activate."
        >
          Start Recording
        </button>
      )}

      {showStopButton && (
        <button
          onClick={onStopRecording}
          onKeyDown={(e) => {
            // Support Enter and Space keys
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!disabled) {
                onStopRecording();
              }
            }
          }}
          disabled={disabled}
          className="btn btn-danger focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto min-h-[44px]"
          aria-label="Stop video recording. Press Enter or Space to activate."
        >
          Stop Recording
        </button>
      )}
    </div>
  );
}

