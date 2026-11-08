import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { Vehicle } from '../models/Vehicle.js';
import { MAX_PASSENGERS } from '../validators/vehicle.validator.js';

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create({ ...req.body, ownerId: req.user._id });
  res.status(201).json({ success: true, data: { vehicle: vehicle.toOwnerJSON() } });
});

export const listMyVehicles = asyncHandler(async (req, res) => {
  const filter = { ownerId: req.user._id };
  if (['active', 'inactive'].includes(req.query.status)) filter.status = req.query.status;

  const vehicles = await Vehicle.find(filter)
    .select('+registrationPrivate')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: { vehicles: vehicles.map((v) => v.toOwnerJSON()) } });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user._id }).select(
    '+registrationPrivate'
  );
  if (!vehicle) throw new AppError(404, 'NOT_FOUND', 'Vehicle not found.');

  Object.assign(vehicle, req.body);

  // The type and capacity must still make sense together after the change
  const max = MAX_PASSENGERS[vehicle.type];
  if (vehicle.capacity > max) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Please check the submitted fields.', [
      { field: 'capacity', message: `A ${vehicle.type} can carry at most ${max} passenger(s).` },
    ]);
  }

  await vehicle.save();
  res.json({ success: true, data: { vehicle: vehicle.toOwnerJSON() } });
});

// "Delete" only deactivates, because past rides still refer to this vehicle (FR-VEH-01)
export const deactivateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user._id },
    { status: 'inactive' },
    { new: true }
  );
  if (!vehicle) throw new AppError(404, 'NOT_FOUND', 'Vehicle not found.');

  res.json({ success: true, data: { message: 'Vehicle deactivated.' } });
});