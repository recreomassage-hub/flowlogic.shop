export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface VideoValidationInput {
  blob: Blob;
  duration: number; // Duration in seconds
}

const MAX_DURATION_SECONDS = 45;
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = ['video/webm', 'video/mp4', 'video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/mp4;codecs=h264'];

export async function validateVideo({ blob, duration }: VideoValidationInput): Promise<ValidationResult> {
  const errors: string[] = [];

  // Check duration
  if (duration > MAX_DURATION_SECONDS) {
    errors.push(`Video too long. Maximum duration is ${MAX_DURATION_SECONDS} seconds.`);
  }

  // Check size
  if (blob.size > MAX_SIZE_BYTES) {
    errors.push('Video too large. Please record a shorter video. Maximum size is 50MB.');
  }

  // Check format
  const isValidFormat = ALLOWED_MIME_TYPES.some(type => blob.type.includes(type.split('/')[1]?.split(';')[0] || ''));
  if (!isValidFormat && blob.type) {
    errors.push('Invalid video format. Please use WebM or MP4 format.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}



