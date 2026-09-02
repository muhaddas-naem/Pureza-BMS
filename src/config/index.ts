import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbDriver: (process.env.DB_DRIVER || 'mysql').toLowerCase(),
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '3306', 10),
  dbUser: process.env.DB_USER || 'purezast_pbms',
  dbPassword: process.env.DB_PASSWORD || 'rhqn3RUDPj$^iSR',
  dbName: (process.env.DB_NAME && process.env.DB_NAME !== 'pbms_db') ? process.env.DB_NAME : 'purezast_pbms',
  openRouterApiKey:
    process.env.OPENROUTER_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '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',
  openRouterModel: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
  companyName: process.env.COMPANY_NAME || 'Pureza',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'pbms-production-jwt-secret-key-2026-super-secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
