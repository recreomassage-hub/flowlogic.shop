import { useRef, useEffect, useState } from 'react';

interface VideoPreviewProps {
  videoUrl: string | null;
  videoBlob: Blob | null;
  onRetry: () => void;
  onUpload: () => void;
  isUploadDisabled?: boolean;
  validationErrors?: string[];
}

export function VideoPreview({
  videoUrl,
  videoBlob,
  onRetry,
  onUpload,
  isUploadDisabled = false,
  validationErrors = [],
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [fileSize, setFileSize] = useState<string>('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    video.src = videoUrl;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(Math.floor(video.duration));
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  useEffect(() => {
    if (videoBlob) {
      const sizeInMB = (videoBlob.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${sizeInMB} MB`);
    }
  }, [videoBlob]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videoUrl || !videoBlob) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 px-4" role="region" aria-label="Recorded video preview">
      <div className="relative w-full max-w-4xl mx-auto">
        <video
          ref={videoRef}
          controls
          className="w-full h-auto rounded-lg shadow-lg bg-black"
          style={{ aspectRatio: '16/9' }}
          aria-label={`Recorded video. Duration: ${formatDuration(duration)}. Size: ${fileSize}`}
        />
      </div>

      <div className="flex justify-center gap-4 text-sm text-gray-600">
        {duration > 0 && (
          <div>
            <span className="font-semibold">Duration:</span> {formatDuration(duration)}
          </div>
        )}
        {fileSize && (
          <div>
            <span className="font-semibold">Size:</span> {fileSize}
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold mb-2">Validation Errors:</p>
          <ul className="list-disc list-inside text-red-700">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
        <button
          onClick={onRetry}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRetry();
            }
          }}
          className="btn btn-secondary focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto min-h-[44px]"
          aria-label="Retry recording. Press Enter or Space to activate."
        >
          Retry
        </button>
        <button
          onClick={onUpload}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!isUploadDisabled && validationErrors.length === 0) {
                onUpload();
              }
            }
          }}
          disabled={isUploadDisabled || validationErrors.length > 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full sm:w-auto min-h-[44px]"
          aria-label="Upload video. Press Enter or Space to activate."
        >
          Upload Video
        </button>
      </div>
    </div>
  );
}

