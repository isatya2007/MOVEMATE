import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
    bio: z.string().trim().max(300, 'Bio can be at most 300 characters'),
    community: z.string().trim().max(80),
    photoUrl: z
      .string()
      .trim()
      .refine((v) => v === '' || /^https:\/\//.test(v), 'Photo link must start with https://'),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'Provide at least one field to update');