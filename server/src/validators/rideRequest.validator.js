import { z } from 'zod';

// [longitude, latitude]
const coordinates = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

const place = z.object({
  label: z.string().trim().min(2, 'Enter a place name').max(120),
  coordinates,
});

export const createRideRequestSchema = z.object({
  pickup: place,
  dropoff: place,
  passengerCount: z
    .number({ message: 'Passenger count must be a number' })
    .int('Passenger count must be a whole number')
    .min(1, 'At least 1 passenger')
    .max(8),
  message: z.string().trim().max(200, 'Message can be at most 200 characters').optional(),
});

export const respondRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled'], {
    message: 'Status must be accepted, rejected or cancelled',
  }),
  reason: z.string().trim().min(3, 'Reason is too short').max(200).optional(),
});