// TC-04, fully automatic.
// Creates 3 throwaway users, a vehicle, and several one-seat rides.
// For each ride, two travelers ask for the LAST seat and the provider
// accepts both requests at the SAME moment.
// Expected every round: one HTTP 200, one HTTP 409, and seatsAvailable = 0.
//
// Run (server must be running in another terminal):
//   node scripts/auto-concurrency-test.js
// Optional: more rounds ->  $env:ROUNDS="10"; node scripts/auto-concurrency-test.js

const BASE = process.env.BASE || 'http://localhost:5000/api/v1';
const ROUNDS = Number(process.env.ROUNDS) || 5;

async function api(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function must(res, expectedStatus, what) {
  if (res.status !== expectedStatus) {
    console.error(`\nSetup step failed: ${what}`);
    console.error(`Expected HTTP ${expectedStatus} but got ${res.status}`);
    console.error(JSON.stringify(res.json, null, 2));
    process.exit(1);
  }
  return res.json.data;
}

async function register(name) {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const res = await api('POST', '/auth/register', null, {
    name,
    email: `${name.toLowerCase()}.${stamp}@test.com`,
    password: 'Pass1234',
    consent: true,
  });
  return must(res, 201, `register ${name}`).token;
}

console.log('Creating 3 test users (A = provider, B and C = travelers)...');
const tokenA = await register('Provider');
const tokenB = await register('TravelerB');
const tokenC = await register('TravelerC');

const vehicle = must(
  await api('POST', '/vehicles', tokenA, { type: 'car', make: 'Test', model: 'Car', capacity: 4 }),
  201,
  'create vehicle'
).vehicle;

const requestBody = {
  pickup: { label: 'Raj Nagar', coordinates: [77.44, 28.745] },
  dropoff: { label: 'New Delhi Station', coordinates: [77.23, 28.645] },
  passengerCount: 1,
};

let passed = 0;

for (let round = 1; round <= ROUNDS; round++) {
  // A publishes a ride with exactly ONE seat
  const ride = must(
    await api('POST', '/rides', tokenA, {
      vehicleId: vehicle.id,
      origin: { label: 'KIET, Ghaziabad', coordinates: [77.45, 28.75] },
      destination: { label: 'New Delhi Railway Station', coordinates: [77.22, 28.64] },
      departureAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      seatsTotal: 1,
    }),
    201,
    'publish ride'
  ).ride;

  // B and C both ask for that one seat (nothing is reserved yet, so both succeed)
  const reqB = must(await api('POST', `/rides/${ride.id}/requests`, tokenB, requestBody), 201, 'B requests seat').request;
  const reqC = must(await api('POST', `/rides/${ride.id}/requests`, tokenC, requestBody), 201, 'C requests seat').request;

  // THE RACE: both accepts are sent at the same moment
  const [r1, r2] = await Promise.all([
    api('PATCH', `/ride-requests/${reqB.id}`, tokenA, { status: 'accepted' }),
    api('PATCH', `/ride-requests/${reqC.id}`, tokenA, { status: 'accepted' }),
  ]);

  const after = await api('GET', `/rides/${ride.id}`, tokenA);
  const seats = after.json.data.ride.seatsAvailable;

  const statuses = [r1.status, r2.status].sort();
  const ok = statuses[0] === 200 && statuses[1] === 409 && seats === 0;
  if (ok) passed++;

  console.log(
    `Round ${round}: accepts -> ${r1.status} and ${r2.status}, seatsAvailable = ${seats}  ${ok ? 'PASS' : 'FAIL'}`
  );
}

console.log(`\n${passed} of ${ROUNDS} rounds passed.`);
console.log(
  passed === ROUNDS
    ? 'TC-04 PASSED: the last seat was never booked twice.'
    : 'TC-04 FAILED: send me the output above.'
);