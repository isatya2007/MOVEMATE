// TC-04: two accepts at the same moment for the LAST seat.
// Expected: exactly one succeeds (200) and one fails (409).
//
// Usage (from the server folder):
//   PowerShell:
//     $env:TOKEN="<provider token>"; $env:REQ1="<request id 1>"; $env:REQ2="<request id 2>"; node scripts/concurrency-test.js
//   Mac/Linux:
//     TOKEN=... REQ1=... REQ2=... node scripts/concurrency-test.js

const BASE = process.env.BASE || 'http://localhost:5000/api/v1';
const { TOKEN, REQ1, REQ2 } = process.env;

if (!TOKEN || !REQ1 || !REQ2) {
  console.error('Please set TOKEN, REQ1 and REQ2 (see the comment at the top of this file).');
  process.exit(1);
}

const accept = (id) =>
  fetch(`${BASE}/ride-requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ status: 'accepted' }),
  }).then(async (res) => ({ id, status: res.status, body: await res.json() }));

// Both requests are sent at the same time
const results = await Promise.all([accept(REQ1), accept(REQ2)]);

for (const r of results) {
  console.log(
    `Request ${r.id}: HTTP ${r.status}`,
    r.body.success ? `(seats left: ${r.body.data.seatsAvailable})` : `(${r.body.error.code})`
  );
}

const ok = results.filter((r) => r.status === 200).length;
console.log(ok === 1 ? '\nPASS: exactly one booking was confirmed.' : `\nFAIL: ${ok} bookings were confirmed.`);