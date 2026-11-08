import { Router } from 'express';
import {
  createRide,
  searchRides,
  listMyRides,
  getRide,
  cancelRide,
} from '../controllers/ride.controller.js';
import { createRequest, listRideRequests } from '../controllers/rideRequest.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { createRideSchema, cancelRideSchema, searchRidesSchema } from '../validators/ride.validator.js';
import { createRideRequestSchema } from '../validators/rideRequest.validator.js';

const router = Router();

router.use(protect);

router.post('/', validate(createRideSchema), createRide);

// These two must come BEFORE "/:id", or Express would read "search" as an id
router.get('/search', validateQuery(searchRidesSchema), searchRides);
router.get('/mine', listMyRides);

router.get('/:id', validateObjectId(), getRide);
router.delete('/:id', validateObjectId(), validate(cancelRideSchema), cancelRide);

// Seat requests for one ride (FR-RIDE-04)
router.post('/:id/requests', validateObjectId(), validate(createRideRequestSchema), createRequest);
router.get('/:id/requests', validateObjectId(), listRideRequests);

export default router;