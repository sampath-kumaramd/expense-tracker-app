import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  // Add other environment variables here
});

export const env = envSchema.parse(process.env);
