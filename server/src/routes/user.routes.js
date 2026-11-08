import { Router } from 'express';
import { getMe, updateMe, getUserById } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { updateProfileSchema } from '../validators/user.validator.js';

const router = Router();

router.get('/me', protect, getMe);
router.patch('/me', protect, validate(updateProfileSchema), updateMe);
router.get('/:id', protect, validateObjectId(), getUserById);

export default router;