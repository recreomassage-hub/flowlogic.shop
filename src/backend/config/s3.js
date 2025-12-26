"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3_CONFIG = exports.s3Client = void 0;
exports.generatePresignedUrl = generatePresignedUrl;
exports.getPresignedUrl = getPresignedUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_2 = require("@aws-sdk/client-s3");
const region = process.env.AWS_REGION || 'us-east-1';
const stage = process.env.STAGE || 'dev';
const bucketName = `flowlogic-${stage}-videos`;
exports.s3Client = new client_s3_1.S3Client({ region });
exports.S3_CONFIG = {
    bucketName,
    region,
    presignedUrlTTL: 5 * 60, // 5 minutes
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
};
/**
 * Generate presigned URL for video upload
 */
async function generatePresignedUrl(key, contentType = 'video/mp4') {
    const command = new client_s3_2.PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn: exports.S3_CONFIG.presignedUrlTTL });
}
/**
 * Get presigned URL (alias for compatibility)
 */
async function getPresignedUrl(key, operation = 'putObject', expiresIn = exports.S3_CONFIG.presignedUrlTTL) {
    const command = new client_s3_2.PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: 'video/mp4',
    });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn });
}
//# sourceMappingURL=s3.js.map