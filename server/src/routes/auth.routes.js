
import { Router } from 'express';

import {
    register,
    login,
    logout
} from '../controllers/auth.controller.js';

import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

import {
    registerSchema,
    loginSchema
} from '../validators/auth.validator.js';

const router = Router();

// Register
router.post(
    '/register',
    authLimiter,
    validate(registerSchema),
    register
);

// Login
router.post(
    '/login',
    authLimiter,
    validate(loginSchema),
    login
);

// Logout
router.post(
    '/logout',
    protect,
    logout
);

export default router;
