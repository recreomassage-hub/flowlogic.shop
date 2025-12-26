"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireTier = requireTier;
const aws_jwt_verify_1 = require("aws-jwt-verify");
const cognito_1 = require("../../config/cognito");
const User_1 = require("../../db/models/User");
// Initialize JWT verifier (will be created on first use)
let verifier = null;
function getVerifier() {
    if (!verifier) {
        verifier = aws_jwt_verify_1.CognitoJwtVerifier.create({
            userPoolId: cognito_1.COGNITO_CONFIG.userPoolId,
            tokenUse: 'access',
            clientId: cognito_1.COGNITO_CONFIG.clientId,
        });
    }
    return verifier;
}
/**
 * Middleware to verify JWT token from Cognito
 */
async function authenticateToken(req, res, next) {
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
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
/**
 * Middleware to check user tier
 */
function requireTier(allowedTiers) {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        try {
            const user = await User_1.UserModel.getById(req.user.sub);
            if (!user || !allowedTiers.includes(user.tier)) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: `Tier not allowed. Required: ${allowedTiers.join(', ')}. Current: ${user?.tier || 'unknown'}`,
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Tier check error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to check user tier',
            });
        }
    };
}
//# sourceMappingURL=auth.js.map