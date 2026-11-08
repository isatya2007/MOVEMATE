import { haversineKm, projectOnRoute } from '../utils/geo.js';

// SRS 7.2:  M = 0.40R + 0.25S + 0.20D + 0.15T   (each factor is 0-100)
// Kept in one place so they are easy to tune later.
export const WEIGHTS = { route: 0.4, pickup: 0.25, destination: 0.2, time: 0.15 };
export const MAX_PICKUP_KM = 3; // rides further than this from your pickup are not shown
export const MAX_DROPOFF_KM = 3;

const clamp = (n) => Math.max(0, Math.min(100, n));

/**
 * Scores one ride against what the traveler searched for.
 * Returns null if the ride is not a sensible match at all.
 *   from, to : [lng, lat]    when : Date    windowMinutes : number
 */
export function scoreRide(ride, { from, to, when, windowMinutes }) {
  const route = [
    ride.origin.coordinates,
    ...(ride.waypoints || []).map((w) => w.coordinates),
    ride.destination.coordinates,
  ];

  const pickup = projectOnRoute(from, route);
  const dropoff = projectOnRoute(to, route);

  if (pickup.distanceKm > MAX_PICKUP_KM || dropoff.distanceKm > MAX_DROPOFF_KM) return null;

  // The drop-off must come AFTER the pickup along the ride's direction
  const coveredKm = dropoff.progressKm - pickup.progressKm;
  if (coveredKm <= 0.2) return null;

  const requestedKm = haversineKm(from, to);
  const timeDiffMin = Math.abs(new Date(ride.departureAt) - when) / 60000;

  const R = clamp((100 * requestedKm) / Math.max(requestedKm, coveredKm)); // route compatibility
  const S = clamp(100 * (1 - pickup.distanceKm / MAX_PICKUP_KM)); // pickup proximity
  const D = clamp(100 * (1 - dropoff.distanceKm / MAX_DROPOFF_KM)); // destination compatibility
  const T = clamp(100 * (1 - timeDiffMin / windowMinutes)); // time compatibility

  const score = Math.round(
    WEIGHTS.route * R + WEIGHTS.pickup * S + WEIGHTS.destination * D + WEIGHTS.time * T
  );

  // Plain-language reasons so the user can see WHY it was recommended
  const reasons = [
    `Pickup is about ${pickup.distanceKm.toFixed(1)} km from this route`,
    `Drop-off is about ${dropoff.distanceKm.toFixed(1)} km from this route`,
  ];
  if (timeDiffMin <= 5) {
    reasons.push('Leaves at about your preferred time');
  } else {
    const later = new Date(ride.departureAt) > when;
    reasons.push(`Leaves ${Math.round(timeDiffMin)} min ${later ? 'after' : 'before'} your preferred time`);
  }

  return {
    score,
    breakdown: { route: Math.round(R), pickup: Math.round(S), destination: Math.round(D), time: Math.round(T) },
    reasons,
  };
}
