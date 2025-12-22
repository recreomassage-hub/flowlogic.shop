import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.STAGE || 'dev';
const bucketName = `flowlogic-${stage}-videos`;

export const s3Client = new S3Client({ region });

export const S3_CONFIG = {
  bucketName,
  region,
  presignedUrlTTL: 5 * 60, // 5 minutes
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

/**
 * Generate presigned URL for video upload
 */
export async function generatePresignedUrl(
  key: string,
  contentType: string = 'video/mp4'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: S3_CONFIG.presignedUrlTTL });
}

/**
 * Get presigned URL (alias for compatibility)
 */
export async function getPresignedUrl(
  key: string,
  operation: 'putObject' | 'getObject' = 'putObject',
  expiresIn: number = S3_CONFIG.presignedUrlTTL
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: 'video/mp4',
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

