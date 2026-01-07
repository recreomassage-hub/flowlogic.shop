import { useState, useRef, useEffect, useCallback } from 'react';
import { validateVideo, ValidationResult } from '../utils/videoValidation';

export type RecordingState =
  | 'idle'           // Initial state
  | 'requesting'     // Requesting camera permission
  | 'ready'          // Camera ready, can start recording
  | 'recording'      // Currently recording
  | 'stopped'        // Recording stopped, showing preview
  | 'uploading'      // Uploading to S3
  | 'success'        // Upload successful
  | 'error';         // Error state

interface UseVideoRecorderReturn {
  state: RecordingState;
  stream: MediaStream | null;
  videoBlob: Blob | null;
  videoUrl: string | null;
  duration: number;
  uploadProgress: number;
  error: string | null;
  retryCount: number;
  validationResult: ValidationResult | null;
  
  // Actions
  requestCamera: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  retryRecording: () => void;
  uploadVideo: (uploadUrl: string) => Promise<void>;
  retryUpload: () => void;
  reset: () => void;
}

export function useVideoRecorder(): UseVideoRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Revoke object URLs
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      // Stop recorder if active
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
    };
  }, [stream, videoUrl]);

  const requestCamera = useCallback(async (): Promise<void> => {
    try {
      console.log('[useVideoRecorder] Requesting camera access...');
      setState('requesting');
      setError(null);

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Request camera access
      console.log('[useVideoRecorder] Calling getUserMedia...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1280 },
          height: { ideal: 720, max: 720 },
          frameRate: { ideal: 30, min: 24 },
          aspectRatio: { ideal: 16/9 },
        },
      });

      console.log('[useVideoRecorder] Camera access granted, stream:', mediaStream);
      setStream(mediaStream);
      setState('ready');
    } catch (err: any) {
      console.error('[useVideoRecorder] Error requesting camera:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('Camera not available. Please use a device with a camera.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application.');
      } else {
        setError(`Failed to access camera: ${err.message || 'Unknown error'}. Please try again.`);
      }
      
      setState('error');
    }
  }, []);

  const startRecording = async (): Promise<void> => {
    if (!stream) {
      setError('Camera stream not available. Please request camera access first.');
      setState('error');
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];
      setDuration(0);

      // Determine MIME type (WebM preferred, MP4 fallback for Safari)
      let mimeType = 'video/webm;codecs=vp8';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4;codecs=h264';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm'; // Last resort
        }
      }

      const options: MediaRecorderOptions = {
        mimeType,
        videoBitsPerSecond: 2500000, // ~2.5 Mbps (compression)
      };

      const recorder = new MediaRecorder(stream, options);

      // Handle data available
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        
        // Validate video
        const validation = await validateVideo({ blob, duration });
        setValidationResult(validation);
        
        if (!validation.valid) {
          setError(validation.errors.join(' '));
        }
        
        setState('stopped');
      };

      // Handle errors
      recorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setState('error');
      };

      recorderRef.current = recorder;
      recorder.start(1000); // Collect data every second
      setState('recording');

      // Start duration timer
      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setDuration(elapsed);

        // Auto-stop at 45 seconds (hard limit)
        if (elapsed >= 45) {
          clearInterval(timerInterval);
          stopRecording();
        }
      }, 1000);

      // Store interval ID for cleanup
      (recorderRef.current as any).timerInterval = timerInterval;
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
      setState('error');
    }
  };

  const stopRecording = (): void => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      // Clear timer interval if exists
      const timerInterval = (recorderRef.current as any).timerInterval;
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      recorderRef.current.stop();
    }
  };

  const retryRecording = (): void => {
    // Clear video blob and URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    setError(null);
    setValidationResult(null);
    
    // Reset to ready state (camera stream should still be active)
    if (stream) {
      setState('ready');
    } else {
      setState('idle');
    }
  };

  const uploadVideo = async (uploadUrl: string): Promise<void> => {
    if (!videoBlob) {
      setError('No video to upload. Please record a video first.');
      setState('error');
      return;
    }

    // Validate video before upload
    const validation = await validateVideo({ blob: videoBlob, duration });
    if (!validation.valid) {
      setValidationResult(validation);
      setError(validation.errors.join(' '));
      setState('error');
      return;
    }

    try {
      setState('uploading');
      setError(null);
      setUploadProgress(0);

      // Use fetch with progress tracking (via XMLHttpRequest for better progress)
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setState('success');
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout'));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', videoBlob.type);
        xhr.setRequestHeader('Content-Length', videoBlob.size.toString());
        xhr.timeout = 60000; // 60 seconds
        xhr.send(videoBlob);
      });
    } catch (err: any) {
      console.error('Error uploading video:', err);
      
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      if (newRetryCount < 3) {
        setError(`Upload failed: ${err.message}. You can retry (${newRetryCount}/3 attempts).`);
        setState('error');
      } else {
        setError('Upload failed after 3 attempts. Please record again.');
        setState('error');
      }
    }
  };

  const retryUpload = (): void => {
    // Retry upload is handled by calling uploadVideo again
    // retryCount is already incremented in uploadVideo catch block
  };

  const reset = (): void => {
    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // Revoke URLs
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    // Reset all state
    setState('idle');
    setStream(null);
    setVideoBlob(null);
    setVideoUrl(null);
    setDuration(0);
    setUploadProgress(0);
    setError(null);
    setRetryCount(0);
    chunksRef.current = [];
  };

  return {
    state,
    stream,
    videoBlob,
    videoUrl,
    duration,
    uploadProgress,
    error,
    retryCount,
    validationResult,
    requestCamera,
    startRecording,
    stopRecording,
    retryRecording,
    uploadVideo,
    retryUpload,
    reset,
  };
}

