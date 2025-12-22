import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { COGNITO_CONFIG } from '../../config/cognito';
import { UserModel } from '../../db/models/User';

// Initialize JWT verifier (will be created on first use)
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: COGNITO_CONFIG.userPoolId,
      tokenUse: 'access',
      clientId: COGNITO_CONFIG.clientId,
    });
  }
  return verifier;
}

export interface AuthRequest extends Request {
  user?: {
    sub: string; // Cognito user ID
    email: string;
    'cognito:username': string;
  };
}

/**
 * Middleware to verify JWT token from Cognito
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const payload = await getVerifier().verify(token);
    req.user = {
      sub: payload.sub,
      email: payload.email || '',
      'cognito:username': payload['cognito:username'] || payload.sub,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

/**
 * Middleware to check user tier
 */
export function requireTier(allowedTiers: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const user = await UserModel.getById(req.user.sub);
      if (!user || !allowedTiers.includes(user.tier)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Tier not allowed. Required: ${allowedTiers.join(', ')}. Current: ${user?.tier || 'unknown'}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Tier check error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to check user tier',
      });
    }
  };
}

