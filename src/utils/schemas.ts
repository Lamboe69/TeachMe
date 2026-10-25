import { z } from 'zod';

/**
 * Shared validation schemas.
 *
 * Client-side validation improves the experience, but the backend remains
 * the authority: server-side validation errors are surfaced in the same
 * field-error slots.
 */

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(72, 'Passwords can be at most 72 characters long.')
  .regex(/[A-Za-z]/, 'Include at least one letter.')
  .regex(/[0-9]/, 'Include at least one number.');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .email('Enter a valid email address.');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your full name.')
  .max(80, 'Names can be at most 80 characters long.');

export const registerSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    role: z.enum(['STUDENT', 'TUTOR'], {
      message: 'Choose whether you are joining as a student or a tutor.',
    }),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: 'Please accept the terms to continue.',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The two passwords do not match.',
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/** Booking form validation. The date must be today or later. */
export function buildBookingSchema(today: Date) {
  const todayValue = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return z.object({
    subject: z.string().trim().min(1, 'Choose the subject you want help with.'),
    date: z
      .string()
      .min(1, 'Choose a date for your session.')
      .refine((value) => {
        const parsed = new Date(`${value}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return false;
        return parsed.getTime() >= todayValue.getTime();
      }, 'Choose a date that is today or later.'),
    time: z
      .string()
      .min(1, 'Choose a time for your session.')
      .regex(/^\d{2}:\d{2}$/, 'Choose a valid time.'),
    message: z
      .string()
      .trim()
      .max(500, 'Keep your message under 500 characters.')
      .optional(),
  });
}

export type BookingFormValues = z.infer<ReturnType<typeof buildBookingSchema>>;

export const feedbackSchema = z.object({
  rating: z
    .number({ message: 'Choose a rating between 1 and 5 stars.' })
    .int('Choose a whole number of stars.')
    .min(1, 'Choose a rating between 1 and 5 stars.')
    .max(5, 'Choose a rating between 1 and 5 stars.'),
  comment: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters.')
    .max(1000, 'Reviews can be at most 1000 characters long.'),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export const profileSchema = z.object({
  fullName: nameSchema,
  phone: z
    .string()
    .trim()
    .max(20, 'That phone number looks too long.')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .trim()
    .max(600, 'Your bio can be at most 600 characters long.')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
