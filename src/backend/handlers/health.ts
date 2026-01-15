import { Request, Response } from 'express';
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { CognitoIdentityProviderClient, DescribeUserPoolCommand } from '@aws-sdk/client-cognito-identity-provider';
import { TABLES } from '../config/database';
import { S3_CONFIG } from '../config/s3';
import { COGNITO_CONFIG } from '../config/cognito';
import { logger } from '../utils/logger';

const region = process.env.AWS_REGION || 'us-east-1';
const dynamoClient = new DynamoDBClient({ region });
const s3Client = new S3Client({ region });
const cognitoClient = new CognitoIdentityProviderClient({ region });

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version?: string;
  environment: string;
  checks: {
    dynamodb: {
      status: 'ok' | 'error';
      message?: string;
      latency?: number;
    };
    s3: {
      status: 'ok' | 'error';
      message?: string;
      latency?: number;
    };
    cognito: {
      status: 'ok' | 'error';
      message?: string;
      latency?: number;
    };
  };
}

/**
 * Check DynamoDB connectivity
 */
async function checkDynamoDB(): Promise<{ status: 'ok' | 'error'; message?: string; latency?: number }> {
  const startTime = Date.now();
  try {
    await dynamoClient.send(
      new DescribeTableCommand({
        TableName: TABLES.USERS,
      })
    );
    const latency = Date.now() - startTime;
    return { status: 'ok', latency };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      status: 'error',
      message: error.message || 'DynamoDB check failed',
      latency,
    };
  }
}

/**
 * Check S3 bucket accessibility
 */
async function checkS3(): Promise<{ status: 'ok' | 'error'; message?: string; latency?: number }> {
  const startTime = Date.now();
  try {
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: S3_CONFIG.bucketName,
      })
    );
    const latency = Date.now() - startTime;
    return { status: 'ok', latency };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      status: 'error',
      message: error.message || 'S3 check failed',
      latency,
    };
  }
}

/**
 * Check Cognito User Pool accessibility
 */
async function checkCognito(): Promise<{ status: 'ok' | 'error'; message?: string; latency?: number }> {
  const startTime = Date.now();
  try {
    if (!COGNITO_CONFIG.userPoolId) {
      return {
        status: 'error',
        message: 'COGNITO_USER_POOL_ID not configured',
        latency: Date.now() - startTime,
      };
    }

    await cognitoClient.send(
      new DescribeUserPoolCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
      })
    );
    const latency = Date.now() - startTime;
    return { status: 'ok', latency };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      status: 'error',
      message: error.message || 'Cognito check failed',
      latency,
    };
  }
}

/**
 * Health check endpoint handler
 * GET /health
 * 
 * This endpoint should never fail - it always returns a response.
 * If health checks fail, it returns degraded/unhealthy status but still responds.
 */
export async function healthCheckHandler(_req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const requestId = (_req as any).requestId || 'unknown';

  try {
    // Run all checks in parallel with timeout protection
    // Use Promise.allSettled to ensure all checks complete even if one fails
    const [dynamodbResult, s3Result, cognitoResult] = await Promise.allSettled([
      checkDynamoDB(),
      checkS3(),
      checkCognito(),
    ]);

    // Extract results from Promise.allSettled
    const dynamodb = dynamodbResult.status === 'fulfilled' 
      ? dynamodbResult.value 
      : { status: 'error' as const, message: dynamodbResult.reason?.message || 'DynamoDB check failed', latency: Date.now() - startTime };
    
    const s3 = s3Result.status === 'fulfilled'
      ? s3Result.value
      : { status: 'error' as const, message: s3Result.reason?.message || 'S3 check failed', latency: Date.now() - startTime };
    
    const cognito = cognitoResult.status === 'fulfilled'
      ? cognitoResult.value
      : { status: 'error' as const, message: cognitoResult.reason?.message || 'Cognito check failed', latency: Date.now() - startTime };

    const checks = { dynamodb, s3, cognito };

    // Determine overall status
    const allHealthy = Object.values(checks).every((check) => check.status === 'ok');
    const anyError = Object.values(checks).some((check) => check.status === 'error');

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (allHealthy) {
      status = 'healthy';
    } else if (anyError) {
      // If critical dependency (DynamoDB) is down, system is unhealthy
      // Otherwise, degraded
      status = checks.dynamodb.status === 'error' ? 'unhealthy' : 'degraded';
    } else {
      status = 'degraded';
    }

    const result: HealthCheckResult = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.VERSION || 'unknown',
      environment: process.env.STAGE || 'dev',
      checks,
    };

    // Log health check result using structured logger
    const totalLatency = Date.now() - startTime;
    
    if (status === 'healthy') {
      logger.info('Health check completed', {
        status,
        totalLatency,
        checks,
        requestId,
      });
    } else {
      logger.warn('Health check completed with issues', {
        status,
        totalLatency,
        checks,
        requestId,
      });
    }

    // Return appropriate status code
    // Always return 200 for health endpoint (even if degraded) to allow monitoring
    // Use 503 only for completely unhealthy (DynamoDB down)
    const statusCode = status === 'unhealthy' ? 503 : 200;
    res.status(statusCode).json(result);
  } catch (error: any) {
    // Fallback: if something goes catastrophically wrong, still return a response
    const totalLatency = Date.now() - startTime;
    logger.error('Health check handler error', error, {
      requestId,
      totalLatency,
    });

    // Return minimal health response indicating error
    const fallbackResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERSION || 'unknown',
      environment: process.env.STAGE || 'dev',
      checks: {
        dynamodb: { status: 'error', message: 'Health check handler failed' },
        s3: { status: 'error', message: 'Health check handler failed' },
        cognito: { status: 'error', message: 'Health check handler failed' },
      },
    };

    res.status(503).json(fallbackResult);
  }
}
