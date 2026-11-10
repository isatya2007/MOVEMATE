import { Notification } from '../models/Notification.js'

// SRS 8.3: a failed notification must NEVER undo a booking that already succeeded.
// So both functions catch every error and only write it to the log.

// Shorten "KIET Group of Institutions, Muradnagar, Ghaziabad" to "KIET Group of Institutions"
export const shortPlace = (label = '') => label.split(',')[0].trim()

export const rideLabel = (ride) => `${shortPlace(ride.origin.label)} → ${shortPlace(ride.destination.label)}`

function clean({ type, title, body, relatedEntity }) {
  return { type, title: title.slice(0, 120), body: body.slice(0, 300), relatedEntity }
}

export async function notify(userId, payload) {
  try {
    await Notification.create({ userId, ...clean(payload) })
  } catch (err) {
    console.error('Notification failed (the booking itself is not affected):', err.message)
  }
}

export async function notifyMany(userIds, payload) {
  try {
    if (!userIds.length) return
    await Notification.insertMany(userIds.map((userId) => ({ userId, ...clean(payload) })))
  } catch (err) {
    console.error('Notifications failed (the booking itself is not affected):', err.message)
  }
}