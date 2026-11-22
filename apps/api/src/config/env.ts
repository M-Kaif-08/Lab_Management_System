import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded regardless of whether running from root or apps/api
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  PUBLIC_URL: z.string().default('http://localhost:5000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/lab_db'),
  JWT_SECRET: z.string().min(16).default('lab_management_system_super_secret_key_change_in_prod'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  STORAGE_PATH: z.string().default('./storage'),
  CORS_ORIGIN: z.string().default('*')
});

export const env = EnvSchema.parse(process.env);
