
import { asyncHandler } from '../utils/asyncHandler.js';

import {
    registerUser,
    loginUser
} from '../services/auth.service.js';

// Register controller
export const register = asyncHandler(async (req, res) => {
    const { user, token } = await registerUser(req.body);

    res.status(201).json({
        success: true,
        data: {
            user: user.toSelf(),
            token
        }
    });
});

// Login controller
export const login = asyncHandler(async (req, res) => {
    const { user, token } = await loginUser(req.body);

    res.status(200).json({
        success: true,
        data: {
            user: user.toSelf(),
            token
        }
    });
});

// Logout controller
export const logout = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            message: 'Logged out.'
        }
    });
});
