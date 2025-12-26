"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
exports.updateCurrentUser = updateCurrentUser;
const User_1 = require("../../db/models/User");
/**
 * Get current user
 */
async function getCurrentUser(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await User_1.UserModel.getById(req.user.sub);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            tier: user.tier,
            wellness_disclaimer_accepted: user.wellness_disclaimer_accepted,
            created_at: user.created_at,
            last_login_at: user.last_login_at,
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get user',
        });
    }
}
/**
 * Update current user
 */
async function updateCurrentUser(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { name } = req.body;
        const updates = {};
        if (name !== undefined) {
            updates.name = name;
        }
        const updatedUser = await User_1.UserModel.update(req.user.sub, updates);
        res.status(200).json({
            user_id: updatedUser.user_id,
            email: updatedUser.email,
            name: updatedUser.name,
            tier: updatedUser.tier,
            updated_at: updatedUser.updated_at,
        });
    }
    catch (error) {
        console.error('Update current user error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update user',
        });
    }
}
//# sourceMappingURL=userController.js.map