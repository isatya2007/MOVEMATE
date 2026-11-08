import { Router } from 'express';
import {
  createVehicle,
  listMyVehicles,
  updateVehicle,
  deactivateVehicle,
} from '../controllers/vehicle.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator.js';

const router = Router();

router.use(protect); // every vehicle route needs a login

router.post('/', validate(createVehicleSchema), createVehicle);
router.get('/', listMyVehicles);
router.patch('/:id', validateObjectId(), validate(updateVehicleSchema), updateVehicle);
router.delete('/:id', validateObjectId(), deactivateVehicle);

export default router;