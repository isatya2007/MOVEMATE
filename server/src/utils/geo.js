// Small geo helpers. Coordinates are always [longitude, latitude] (GeoJSON order).

const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

// Straight-line distance between two points on the earth (in km)
export function haversineKm([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Finds the point on a route (list of [lng, lat]) that is closest to `point`.
// Returns:
//   distanceKm : how far `point` is from the route
//   progressKm : how far along the route that closest point is, from the start
// Good enough for city/intercity distances (it treats the small area as flat).
export function projectOnRoute(point, route) {
  const cosLat = Math.cos(toRad(point[1]));
  // Convert to a flat x/y plane in km with `point` at (0, 0)
  const toXY = ([lng, lat]) => [(lng - point[0]) * 111.32 * cosLat, (lat - point[1]) * 110.574];

  let best = { distanceKm: Infinity, progressKm: 0 };
  let travelled = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const segmentKm = haversineKm(route[i], route[i + 1]);
    const [ax, ay] = toXY(route[i]);
    const [bx, by] = toXY(route[i + 1]);
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;

    // t = where on this segment (0 = start, 1 = end) is closest to (0, 0)
    let t = len2 === 0 ? 0 : -(ax * dx + ay * dy) / len2;
    t = Math.max(0, Math.min(1, t));

    const distanceKm = Math.hypot(ax + t * dx, ay + t * dy);
    if (distanceKm < best.distanceKm) {
      best = { distanceKm, progressKm: travelled + t * segmentKm };
    }
    travelled += segmentKm;
  }
  return best;
}