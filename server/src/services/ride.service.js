import { Ride } from '../models/Ride.js';
import { Vehicle } from '../models/Vehicle.js';
import { AppError } from '../utils/AppError.js';
import { scoreRide } from './matching.service.js';
import { RideRequest } from '../models/RideRequest.js';

const PROVIDER_FIELDS = 'name profile.photoUrl community verificationStatus createdAt';
const VEHICLE_FIELDS = 'type make model colour capacity'; // registration number is never selected

// Shapes a ride for the API (works for both normal and .lean() documents)
export function formatRide(r) {
  const p = r.providerId && r.providerId._id ? r.providerId : null;
  const v = r.vehicleId && r.vehicleId._id ? r.vehicleId : null;

  return {
    id: r._id,
    origin: r.origin,
    destination: r.destination,
    waypoints: r.waypoints,
    departureAt: r.departureAt,
    seatsTotal: r.seatsTotal,
    seatsAvailable: r.seatsAvailable,
    farePerSeat: r.farePerSeat, // estimate
    preferences: r.preferences,
    notes: r.notes,
    status: r.status,
    cancelReason: r.cancelReason,
    provider: p && {
      id: p._id,
      name: p.name,
      photoUrl: p.profile?.photoUrl,
      community: p.community?.name,
      verificationStatus: p.verificationStatus,
      memberSince: p.createdAt,
    },
    vehicle: v && {
      id: v._id,
      type: v.type,
      make: v.make,
      model: v.model,
      colour: v.colour,
      capacity: v.capacity,
    },
  };
}

const withDetails = (query) =>
  query.populate('providerId', PROVIDER_FIELDS).populate('vehicleId', VEHICLE_FIELDS);

export async function publishRide(user, data) {
  const vehicle = await Vehicle.findOne({ _id: data.vehicleId, ownerId: user._id });
  if (!vehicle) throw new AppError(404, 'NOT_FOUND', 'Vehicle not found.');
  if (vehicle.status !== 'active') {
    throw new AppError(409, 'VEHICLE_INACTIVE', 'This vehicle is deactivated. Activate it first.');
  }

  // FR-VEH-03: never offer more seats than the vehicle can carry
  if (data.seatsTotal > vehicle.capacity) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Please check the submitted fields.', [
      {
        field: 'seatsTotal',
        message: `This vehicle has ${vehicle.capacity} passenger seat(s). You cannot offer more.`,
      },
    ]);
  }

  const ride = await Ride.create({
    ...data,
    providerId: user._id,
    seatsAvailable: data.seatsTotal,
  });

  return formatRide(await withDetails(Ride.findById(ride._id)).lean());
}

export async function searchRides(user, q) {
  const when = q.when;
  const windowMs = q.windowMinutes * 60 * 1000;

  const filter = {
    status: 'published',
    seatsAvailable: { $gte: q.passengers },
    providerId: { $ne: user._id }, // you cannot book your own ride
    departureAt: {
      $gte: new Date(Math.max(when.getTime() - windowMs, Date.now())),
      $lte: new Date(when.getTime() + windowMs),
    },
  };
  if (q.petsAllowed) filter['preferences.petsAllowed'] = true;
  if (q.noSmoking) filter['preferences.noSmoking'] = true;

  // Step 1: cheap database filter. Step 2: score the few that remain.
  const candidates = await withDetails(Ride.find(filter).limit(200)).lean();

  const search = {
    from: [q.fromLng, q.fromLat],
    to: [q.toLng, q.toLat],
    when,
    windowMinutes: q.windowMinutes,
  };

  const matches = candidates
    .map((ride) => ({ ride, match: scoreRide(ride, search) }))
    .filter((x) => x.match)
    .sort(
      (a, b) =>
        b.match.score - a.match.score || new Date(a.ride.departureAt) - new Date(b.ride.departureAt)
    );

  const start = (q.page - 1) * q.limit;
  return {
    rides: matches.slice(start, start + q.limit).map((x) => ({ ...formatRide(x.ride), match: x.match })),
    page: q.page,
    limit: q.limit,
    total: matches.length,
  };
}

export async function getRide(user, rideId) {
  const ride = await withDetails(Ride.findById(rideId)).lean();
  const isOwner = ride && String(ride.providerId._id) === String(user._id);

  // Cancelled rides are only visible to the provider
  if (!ride || (ride.status === 'cancelled' && !isOwner)) {
    throw new AppError(404, 'NOT_FOUND', 'Ride not found.');
  }
  return formatRide(ride);
}

export async function listMyRides(user, status) {
  const filter = { providerId: user._id };
  if (['published', 'in_progress', 'completed', 'cancelled'].includes(status)) filter.status = status;

  const rides = await withDetails(Ride.find(filter).sort({ departureAt: -1 })).lean();
  return rides.map(formatRide);
}

export async function cancelRide(user, rideId, reason) {
  // One atomic update: only the owner can cancel, and only while it is still "published"
  const ride = await Ride.findOneAndUpdate(
    { _id: rideId, providerId: user._id, status: 'published' },
    { status: 'cancelled', cancelReason: reason, cancelledAt: new Date() },
    { new: true }
  );

   if (!ride) {
    const exists = await Ride.exists({ _id: rideId, providerId: user._id });
    if (!exists) throw new AppError(404, 'NOT_FOUND', 'Ride not found.');
    throw new AppError(409, 'RIDE_NOT_CANCELLABLE', 'Only published rides can be cancelled.');
  }

  // Everyone who asked for (or was given) a seat on this ride is cancelled too
  await RideRequest.updateMany(
    { rideId, status: { $in: ['pending', 'accepted'] } },
    { status: 'cancelled', cancelReason: 'Ride cancelled by the provider', cancelledAt: new Date() }
  );
  return ride;
}