import { z } from 'zod';

export const userRoles = ['admin', 'editor', 'viewer'] as const;
export type UserRole = (typeof userRoles)[number];

const isoDate = z
  .string({ description: 'ISO date (YYYY-MM-DD)' })
  .regex(/^(\d{4})-(\d{2})-(\d{2})$/, 'Expected YYYY-MM-DD');

const phone = z.string().min(1, 'Phone number is required');

export const baseUserSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  birthDate: isoDate.optional(),
  role: z.enum(userRoles),
});

export type User = z.infer<typeof baseUserSchema>;

export const createUserSchema = baseUserSchema
  .omit({ id: true })
  .extend({
    phoneNumber: z.string().optional(),
    birthDate: isoDate.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'admin') {
      if (!data.phoneNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['phoneNumber'],
          message: 'Phone number is required for admins',
        });
      }
      if (!data.birthDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthDate'],
          message: 'Birth date is required for admins',
        });
      }
    }

    if (data.role === 'editor' && !data.phoneNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phoneNumber'],
        message: 'Phone number is required for editors',
      });
    }
  });

export const updateUserSchema = baseUserSchema.partial({
  firstName: true,
  lastName: true,
  email: true,
  role: true,
});
