import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const TOKEN_COOKIE_NAME = 'token';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
  path: '/',
});

export const setAuthCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
  });
};
