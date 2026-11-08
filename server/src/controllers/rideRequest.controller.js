import { asyncHandler } from '../utils/asyncHandler.js';
import * as booking from '../services/booking.service.js';

export const createRequest = asyncHandler(async (req, res) => {
  const request = await booking.createRequest(req.user, req.params.id, req.body);
  res.status(201).json({ success: true, data: { request } });
});

export const listRideRequests = asyncHandler(async (req, res) => {
  const requests = await booking.listRequestsForRide(req.user, req.params.id, req.query.status);
  res.json({ success: true, data: { requests } });
});

export const listMyRequests = asyncHandler(async (req, res) => {
  const requests = await booking.listMyRequests(req.user, req.query.status);
  res.json({ success: true, data: { requests } });
});

export const respondToRequest = asyncHandler(async (req, res) => {
  const result = await booking.respondToRequest(req.user, req.params.id, req.body);
  res.json({ success: true, data: result });
});