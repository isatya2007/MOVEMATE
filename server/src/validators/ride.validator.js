import { z } from 'zod';
import { haversineKm } from '../utils/geo.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

// [longitude, latitude]
const coordinates = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

const place = z.object({
  label: z.string().trim().min(2, 'Enter a place name').max(120),
  coordinates,
});

export const createRideSchema = z
  .object({
    vehicleId: objectId,
    origin: place,
    destination: place,
    waypoints: z.array(place).max(5, 'At most 5 waypoints').optional(),
    departureAt: z.coerce.date({ message: 'Enter a valid date and time' }),
    seatsTotal: z
      .number({ message: 'Seats must be a number' })
      .int('Seats must be a whole number')
      .min(1, 'Offer at least 1 seat')
      .max(12),
    farePerSeat: z.number().min(0).max(10000).optional(), // an estimate (BR-09)
    preferences: z
      .object({
        noSmoking: z.boolean().optional(),
        petsAllowed: z.boolean().optional(),
        luggageAllowed: z.boolean().optional(),
      })
      .optional(),
    notes: z.string().trim().max(300, 'Notes can be at most 300 characters').optional(),
  })
  .refine((d) => d.departureAt.getTime() > Date.now() + 5 * 60 * 1000, {
    message: 'Departure must be at least 5 minutes from now',
    path: ['departureAt'],
  })
  .refine((d) => d.departureAt.getTime() < Date.now() + 180 * 24 * 60 * 60 * 1000, {
    message: 'Departure can be at most 6 months ahead',
    path: ['departureAt'],
  })
  .refine((d) => haversineKm(d.origin.coordinates, d.destination.coordinates) >= 0.3, {
    message: 'Origin and destination are too close together',
    path: ['destination'],
  });

export const cancelRideSchema = z.object({
  reason: z.string().trim().min(3, 'Please give a short reason').max(200),
});

// ---- Search (values arrive as text in the URL, so we convert them) ----
const boolText = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .optional();

export const searchRidesSchema = z
  .object({
    fromLat: z.coerce.number({ message: 'fromLat is required' }).min(-90).max(90),
    fromLng: z.coerce.number({ message: 'fromLng is required' }).min(-180).max(180),
    toLat: z.coerce.number({ message: 'toLat is required' }).min(-90).max(90),
    toLng: z.coerce.number({ message: 'toLng is required' }).min(-180).max(180),
    when: z.coerce.date({ message: 'Enter a valid date and time' }),
    windowMinutes: z.coerce.number().int().min(15).max(720).default(120),
    passengers: z.coerce.number().int().min(1).max(8).default(1),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(30).default(10),
    petsAllowed: boolText,
    noSmoking: boolText,
  })
  .refine((d) => haversineKm([d.fromLng, d.fromLat], [d.toLng, d.toLat]) >= 0.3, {
    message: 'Pickup and drop-off are too close together',
    path: ['toLat'],
  });