import { Request, Response } from 'express';
import { SignUpCommand, InitiateAuthCommand, AuthFlowType, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, COGNITO_CONFIG } from '../../config/cognito';
import { UserModel, User } from '../../db/models/User';
import { v4 as uuidv4 } from 'uuid';

/**
 * Register a new user
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, wellness_disclaimer_accepted } = req.body;

    // Validation
    if (!email || !password || wellness_disclaimer_accepted !== true) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email, password, and wellness_disclaimer_accepted are required',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.getByEmail(email);
    if (existingUser) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered',
      });
      return;
    }

    // Create user in Cognito
    const signUpCommand = new SignUpCommand({
      ClientId: COGNITO_CONFIG.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        ...(name ? [{ Name: 'name', Value: name }] : []),
      ],
    });

    await cognitoClient.send(signUpCommand);

    // Auto-confirm user (for dev/staging, skip email verification)
    if (process.env.STAGE === 'dev' || process.env.STAGE === 'staging') {
      const confirmCommand = new AdminConfirmSignUpCommand({
        UserPoolId: COGNITO_CONFIG.userPoolId,
        Username: email,
      });
      await cognitoClient.send(confirmCommand);
    }

    // Create user in DynamoDB
    const userId = uuidv4();
    const user: User = await UserModel.create({
      user_id: userId,
      email,
      name,
      tier: 'free',
      wellness_disclaimer_accepted: true,
      wellness_disclaimer_accepted_at: new Date().toISOString(),
    });

    res.status(201).json({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      wellness_disclaimer_accepted: user.wellness_disclaimer_accepted,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.name === 'UsernameExistsException') {
      res.status(409).json({
        error: 'Conflict',
        message: 'Email already registered',
      });
      return;
    }
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user',
    });
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
      return;
    }

    // Authenticate with Cognito
    const authCommand = new InitiateAuthCommand({
      ClientId: COGNITO_CONFIG.clientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const authResponse = await cognitoClient.send(authCommand);

    if (!authResponse.AuthenticationResult) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    // Get user from database
    const user = await UserModel.getByEmail(email);
    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Update last login
    await UserModel.update(user.user_id, {
      last_login_at: new Date().toISOString(),
    });

    // Set refresh token in httpOnly cookie
    const refreshToken = authResponse.AuthenticationResult.RefreshToken;
    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    res.status(200).json({
      access_token: authResponse.AuthenticationResult.AccessToken,
      expires_in: authResponse.AuthenticationResult.ExpiresIn || 900,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        tier: user.tier,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.name === 'NotAuthorizedException') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to login',
    });
  }
}

/**
 * Logout user
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
}

/**
 * Refresh access token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No refresh token provided',
      });
      return;
    }

    // TODO: Implement token refresh with Cognito
    // This requires additional Cognito SDK calls

    res.status(200).json({
      message: 'Token refresh not yet implemented',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to refresh token',
    });
  }
}


