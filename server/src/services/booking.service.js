import { Ride } from '../models/Ride.js';
import { RideRequest } from '../models/RideRequest.js';
import { AppError } from '../utils/AppError.js';
import { notify, rideLabel } from './notification.service.js';

const REQUESTER_FIELDS = 'name profile.photoUrl community verificationStatus createdAt';

const sameId = (a, b) => String(a) === String(b);

function formatRequest(r) {
  const requester = r.requesterId && r.requesterId._id ? r.requesterId : null;
  const ride = r.rideId && r.rideId._id ? r.rideId : null;

  return {
    id: r._id,
    rideId: ride ? ride._id : r.rideId,
    pickup: r.pickup,
    dropoff: r.dropoff,
    passengerCount: r.passengerCount,
    message: r.message,
    status: r.status,
    rejectReason: r.rejectReason,
    cancelReason: r.cancelReason,
    createdAt: r.createdAt,
    respondedAt: r.respondedAt,
    requester: requester && {
      id: requester._id,
      name: requester.name,
      photoUrl: requester.profile?.photoUrl,
      community: requester.community?.name,
      verificationStatus: requester.verificationStatus,
    },
    ride: ride && {
      id: ride._id,
      origin: ride.origin,
      destination: ride.destination,
      departureAt: ride.departureAt,
      status: ride.status,
      providerName: ride.providerId?.name,
    },
  };
}

// FR-RIDE-04: a traveler asks for seats. This does NOT take seats yet (BR-04).
export async function createRequest(user, rideId, data) {
  const ride = await Ride.findById(rideId);
  if (!ride || ride.status !== 'published') throw new AppError(404, 'NOT_FOUND', 'Ride not found.');

  if (sameId(ride.providerId, user._id)) {
    throw new AppError(400, 'OWN_RIDE', 'You cannot request a seat on your own ride.');
  }
  if (ride.departureAt <= new Date()) {
    throw new AppError(409, 'RIDE_DEPARTED', 'This ride has already departed.');
  }
  if (data.passengerCount > ride.seatsAvailable) {
    throw new AppError(409, 'NOT_ENOUGH_SEATS', `Only ${ride.seatsAvailable} seat(s) left on this ride.`);
  }

  const existing = await RideRequest.exists({
    rideId,
    requesterId: user._id,
    status: { $in: ['pending', 'accepted'] },
  });
  if (existing) {
    throw new AppError(409, 'REQUEST_EXISTS', 'You already have an active request for this ride.');
  }

  const request = await RideRequest.create({ ...data, rideId, requesterId: user._id });

  // Tell the provider (a failure here never undoes the request)
  await notify(ride.providerId, {
    type: 'ride_request',
    title: 'New seat request',
    body: `${user.name} asked for ${data.passengerCount} ${data.passengerCount === 1 ? 'seat' : 'seats'} on your ride ${rideLabel(ride)}.`,
    relatedEntity: { kind: 'ride_request', id: request._id },
  });

  return formatRequest(request.toObject());
}

// Provider: see who asked for seats on one of their rides
export async function listRequestsForRide(user, rideId, status) {
  const ride = await Ride.findOne({ _id: rideId, providerId: user._id });
  if (!ride) throw new AppError(404, 'NOT_FOUND', 'Ride not found.');

  const filter = { rideId };
  if (['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show'].includes(status)) {
    filter.status = status;
  }

  const requests = await RideRequest.find(filter)
    .populate('requesterId', REQUESTER_FIELDS)
    .sort({ createdAt: 1 })
    .lean();
  return requests.map(formatRequest);
}

// Traveler: my own requests with a short summary of each ride
export async function listMyRequests(user, status) {
  const filter = { requesterId: user._id };
  if (['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show'].includes(status)) {
    filter.status = status;
  }

  const requests = await RideRequest.find(filter)
    .populate({
      path: 'rideId',
      select: 'origin destination departureAt status providerId',
      populate: { path: 'providerId', select: 'name' },
    })
    .sort({ createdAt: -1 })
    .lean();
  return requests.map(formatRequest);
}

// ---------------------------------------------------------------------------
// FR-RIDE-05 / FR-RIDE-08: accept, reject or cancel a request
// ---------------------------------------------------------------------------
export async function respondToRequest(user, requestId, { status, reason }) {
  const request = await RideRequest.findById(requestId);
  if (!request) throw new AppError(404, 'NOT_FOUND', 'Request not found.');

  const ride = await Ride.findById(request.rideId);
  const isProvider = ride && sameId(ride.providerId, user._id);
  const isRequester = sameId(request.requesterId, user._id);

  // Strangers get a 404 so they cannot tell the request exists
  if (!isProvider && !isRequester) throw new AppError(404, 'NOT_FOUND', 'Request not found.');

  if (status === 'accepted') {
    if (!isProvider) throw new AppError(403, 'FORBIDDEN', 'Only the ride provider can accept requests.');
    return acceptRequest(request, ride, user);
  }
  if (status === 'rejected') {
    if (!isProvider) throw new AppError(403, 'FORBIDDEN', 'Only the ride provider can reject requests.');
    return rejectRequest(request, ride, user, reason);
  }
  // status === 'cancelled'
  if (!isRequester) throw new AppError(403, 'FORBIDDEN', 'Only the traveler can cancel their request.');
  return cancelRequest(request, ride, user, reason);
}

async function acceptRequest(request, ride, provider) {
  if (request.status !== 'pending') {
    throw new AppError(409, 'REQUEST_NOT_PENDING', 'This request has already been handled.');
  }
  if (ride.status !== 'published' || ride.departureAt <= new Date()) {
    throw new AppError(409, 'RIDE_NOT_AVAILABLE', 'This ride is no longer open for bookings.');
  }

  // STEP 1: take the seats. This ONE database command checks "enough seats?" and
  // subtracts them together, so two accepts at the same moment cannot both succeed.
  const updatedRide = await Ride.findOneAndUpdate(
    { _id: ride._id, status: 'published', seatsAvailable: { $gte: request.passengerCount } },
    { $inc: { seatsAvailable: -request.passengerCount } },
    { new: true }
  );
  if (!updatedRide) {
    throw new AppError(409, 'SEAT_UNAVAILABLE', 'Not enough seats left. Nothing was changed.');
  }

  // STEP 2: confirm the booking, but only if it is still pending.
  const confirmed = await RideRequest.findOneAndUpdate(
    { _id: request._id, status: 'pending' },
    { status: 'accepted', respondedAt: new Date() },
    { new: true }
  );
  if (!confirmed) {
    // Someone cancelled it at the same moment: give the seats back (no partial booking)
    await Ride.updateOne({ _id: ride._id }, { $inc: { seatsAvailable: request.passengerCount } });
    throw new AppError(409, 'REQUEST_NOT_PENDING', 'This request has already been handled.');
  }

  await notify(request.requesterId, {
    type: 'request_accepted',
    title: 'Seat confirmed',
    body: `${provider.name} accepted your request for ${rideLabel(ride)}.`,
    relatedEntity: { kind: 'ride_request', id: request._id },
  });

  return { request: formatRequest(confirmed.toObject()), seatsAvailable: updatedRide.seatsAvailable };
}

async function rejectRequest(request, ride, provider, reason) {
  const rejected = await RideRequest.findOneAndUpdate(
    { _id: request._id, status: 'pending' },
    { status: 'rejected', rejectReason: reason, respondedAt: new Date() },
    { new: true }
  );
  if (!rejected) throw new AppError(409, 'REQUEST_NOT_PENDING', 'This request has already been handled.');

  await notify(request.requesterId, {
    type: 'request_rejected',
    title: 'Request declined',
    body: `${provider.name} could not take your request for ${rideLabel(ride)}.${reason ? ` Reason: ${reason}` : ''}`,
    relatedEntity: { kind: 'ride_request', id: request._id },
  });

  return { request: formatRequest(rejected.toObject()) };
}

async function cancelRequest(request, ride, traveler, reason) {
  if (!ride || ride.status !== 'published') {
    throw new AppError(409, 'RIDE_NOT_AVAILABLE', 'This ride can no longer be changed.');
  }

  // new: false -> we get the document as it was BEFORE the change,
  // so we know whether seats had been taken.
  const before = await RideRequest.findOneAndUpdate(
    { _id: request._id, status: { $in: ['pending', 'accepted'] } },
    { status: 'cancelled', cancelReason: reason, cancelledAt: new Date() },
    { new: false }
  );
  if (!before) throw new AppError(409, 'REQUEST_NOT_CANCELLABLE', 'This request can no longer be cancelled.');

  // Only an accepted request had taken seats
  if (before.status === 'accepted') {
    await Ride.updateOne({ _id: before.rideId }, { $inc: { seatsAvailable: before.passengerCount } });
  }

  await notify(ride.providerId, {
    type: 'request_cancelled',
    title: 'Request cancelled',
    body: `${traveler.name} cancelled their request for ${rideLabel(ride)}.${before.status === 'accepted' ? ' Their seat is free again.' : ''}`,
    relatedEntity: { kind: 'ride_request', id: request._id },
  });

  return { request: formatRequest({ ...before.toObject(), status: 'cancelled', cancelReason: reason }) };
}