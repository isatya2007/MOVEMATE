import { z } from 'zod';

export const VEHICLE_TYPES = ['bike', 'auto', 'car', 'van'];
// Maximum passenger seats (not counting the driver)
export const MAX_PASSENGERS = { bike: 1, auto: 3, car: 7, van: 12 };

const emptyToUndefined = (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const optionalText = (max) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, `Too long (max ${max})`).optional());

// "up 32 ab 1234" -> "UP32AB1234"
const registration = z.preprocess(
  (v) => (typeof v === 'string' ? v.replace(/[\s-]/g, '').toUpperCase() || undefined : v),
  z.string().regex(/^[A-Z0-9]{4,15}$/, 'Enter a valid registration number').optional()
);

const vehicleFields = z.object({
  type: z.enum(VEHICLE_TYPES, { message: 'Choose a vehicle type' }),
  make: optionalText(40),
  model: optionalText(40),
  colour: optionalText(30),
  registrationPrivate: registration,
  capacity: z
    .number({ message: 'Capacity must be a number' })
    .int('Capacity must be a whole number')
    .min(1, 'At least 1 passenger seat')
    .max(12, 'Capacity is too high'),
});

export const createVehicleSchema = vehicleFields.refine(
  (d) => d.capacity <= MAX_PASSENGERS[d.type],
  { message: 'Capacity is too high for this vehicle type', path: ['capacity'] }
);

export const updateVehicleSchema = vehicleFields
  .partial()
  .extend({ status: z.enum(['active', 'inactive']).optional() })
  .refine((d) => Object.keys(d).length > 0, 'Provide at least one field to update');