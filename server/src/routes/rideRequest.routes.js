import { Router } from 'express';
import { listMyRequests, respondToRequest } from '../controllers/rideRequest.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { respondRequestSchema } from '../validators/rideRequest.validator.js';

const router = Router();

router.use(protect);

router.get('/mine', listMyRequests); // before "/:id"
router.patch('/:id', validateObjectId(), validate(respondRequestSchema), respondToRequest);

export default router;