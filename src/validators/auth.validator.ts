import { z } from 'zod';

const nameRule = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters');

const emailRule = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Invalid email format');

const passwordRule = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long');

export const registerSchema = z.object({
  name: nameRule,
  email: emailRule,
  password: passwordRule,
});

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, 'Password is required'),
});
