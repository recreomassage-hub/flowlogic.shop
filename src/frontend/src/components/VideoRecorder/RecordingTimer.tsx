interface RecordingTimerProps {
  duration: number; // Duration in seconds
  maxDuration?: number; // Maximum duration (default: 45)
}

export function RecordingTimer({ duration, maxDuration = 45 }: RecordingTimerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isNearLimit = duration >= maxDuration - 5; // Warning when 5 seconds left
  const isAtLimit = duration >= maxDuration;

  return (
    <div className="text-center px-4" role="timer" aria-live="polite" aria-atomic="true">
      <div
        className={`inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-lg ${
          isAtLimit
            ? 'bg-red-600 text-white'
            : isNearLimit
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-800 text-white'
        }`}
        aria-label={`Recording duration: ${formatTime(duration)}`}
      >
        <div className="text-3xl sm:text-4xl font-mono font-bold" aria-hidden="true">
          {formatTime(duration)}
        </div>
        {isAtLimit && (
          <div className="text-sm mt-1">Recording will stop automatically</div>
        )}
        {isNearLimit && !isAtLimit && (
          <div className="text-sm mt-1">Time almost up</div>
        )}
      </div>
    </div>
  );
}

