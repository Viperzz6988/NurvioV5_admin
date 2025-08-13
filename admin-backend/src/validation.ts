import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }).max(255),
  password: z.string().min(8).max(200),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email().max(255),
  message: z.string().trim().min(10).max(5000),
});