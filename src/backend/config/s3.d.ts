import { S3Client } from '@aws-sdk/client-s3';
export declare const s3Client: S3Client;
export declare const S3_CONFIG: {
    readonly bucketName: string;
    readonly region: string;
    readonly presignedUrlTTL: number;
    readonly maxFileSize: number;
    readonly allowedMimeTypes: readonly ["video/mp4", "video/webm", "video/quicktime"];
};
/**
 * Generate presigned URL for video upload
 */
export declare function generatePresignedUrl(key: string, contentType?: string): Promise<string>;
/**
 * Get presigned URL (alias for compatibility)
 */
export declare function getPresignedUrl(key: string, operation?: 'putObject' | 'getObject', expiresIn?: number): Promise<string>;
//# sourceMappingURL=s3.d.ts.map