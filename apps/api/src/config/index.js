import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET || 'dev-fallback-session-secret-change-in-prod',
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:3000',
  offlineSessionMaxDays: parseInt(process.env.OFFLINE_SESSION_MAX_DAYS || '7', 10),
  bootstrapAdmin: {
    email: process.env.BOOTSTRAP_ADMIN_EMAIL || 'admin@bakkafarm.com',
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD || 'BakkaAdminSecure2026!',
    name: process.env.BOOTSTRAP_ADMIN_NAME || 'Bakka Farm Administrator'
  }
};
