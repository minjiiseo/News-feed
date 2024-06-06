import 'dotenv/config';

export const SERVER_PORT = process.env.SERVER_PORT;

export const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;
export const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY;

export const ACCESS_TOKEN_EXPIRES_IN = '1h';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';

export const SMTP_SERVICE = process.env.SMTP_SERVICE;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
