import { PLACE_SEARCH_BIAS } from '../utils/constants.js'

// Free place search built on OpenStreetMap data (Photon by komoot).
// Fine for a project demo. For a real launch you would switch to a paid provider.
const PHOTON_URL = 'https://photon.komoot.io/api/'

function describe(p) {
  const main = p.name || [p.housenumber, p.street].filter(Boolean).join(' ') || p.city || p.state || ''
  const parts = [p.name ? p.street : null, p.district, p.city, p.state].filter(Boolean)
  // remove repeats, and anything that is the same as the main name
  const secondary = [...new Set(parts)].filter((x) => x !== main).join(', ')
  return { main, secondary }
}

// Returns [{ id, label, main, secondary, coordinates: [lng, lat] }]
export async function searchPlaces(query, signal) {
  const params = new URLSearchParams({
    q: query,
    limit: '6',
    lang: 'en',
    lat: String(PLACE_SEARCH_BIAS.lat),
    lon: String(PLACE_SEARCH_BIAS.lon),
  })

  const res = await fetch(`${PHOTON_URL}?${params}`, { signal })
  if (!res.ok) throw new Error('Place search failed')
  const data = await res.json()

  const seen = new Set()
  const places = []
  for (const feature of data.features || []) {
    const props = feature.properties || {}
    const [lng, lat] = feature.geometry?.coordinates || []
    const { main, secondary } = describe(props)
    const id = `${props.osm_type}${props.osm_id}`

    if (!main || typeof lng !== 'number' || typeof lat !== 'number' || seen.has(id)) continue
    seen.add(id)

    places.push({
      id,
      main,
      secondary,
      label: [main, secondary].filter(Boolean).join(', ').slice(0, 120), // the backend allows 120 characters
      coordinates: [lng, lat], // [longitude, latitude] - the order the backend expects
    })
  }
  return places
}