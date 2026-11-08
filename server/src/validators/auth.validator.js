import { z } from 'zod';

// Treat "" as "not provided"
const emptyToUndefined = (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const email = z.preprocess(
  emptyToUndefined,
  z.string().trim().toLowerCase().email('Enter a valid email address').optional()
);

const phone = z.preprocess(
  emptyToUndefined,
  z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number').optional()
);

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
    email,
    phone,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long')
      .regex(/[A-Za-z]/, 'Password must contain a letter')
      .regex(/\d/, 'Password must contain a number'),
    community: z.string().trim().max(80).optional(),
    consent: z
      .boolean()
      .refine((v) => v === true, 'You must accept the terms and privacy policy'),
  })
  .refine((d) => d.email || d.phone, {
    message: 'Provide an email or a phone number',
    path: ['email'],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or phone number'),
  password: z.string().min(1, 'Enter your password'),
});