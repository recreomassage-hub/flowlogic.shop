import { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  stream: MediaStream | null;
  isVisible: boolean;
}

export function CameraPreview({ stream, isVisible }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream && isVisible) {
      video.srcObject = stream;
      video.play().catch((err) => {
        console.error('Error playing video:', err);
      });
    } else {
      video.srcObject = null;
    }

    // Cleanup
    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto rounded-lg shadow-lg bg-black"
        style={{ aspectRatio: '16/9' }}
        aria-label="Live camera preview"
      />
    </div>
  );
}

