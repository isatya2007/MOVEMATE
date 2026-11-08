import { asyncHandler } from '../utils/asyncHandler.js';
import * as rideService from '../services/ride.service.js';

export const createRide = asyncHandler(async (req, res) => {
  const ride = await rideService.publishRide(req.user, req.body);
  res.status(201).json({ success: true, data: { ride } });
});

export const searchRides = asyncHandler(async (req, res) => {
  const result = await rideService.searchRides(req.user, req.validatedQuery);
  res.json({ success: true, data: result });
});

export const listMyRides = asyncHandler(async (req, res) => {
  const rides = await rideService.listMyRides(req.user, req.query.status);
  res.json({ success: true, data: { rides } });
});

export const getRide = asyncHandler(async (req, res) => {
  const ride = await rideService.getRide(req.user, req.params.id);
  res.json({ success: true, data: { ride } });
});

export const cancelRide = asyncHandler(async (req, res) => {
  await rideService.cancelRide(req.user, req.params.id, req.body.reason);
  res.json({ success: true, data: { message: 'Ride cancelled.' } });
});