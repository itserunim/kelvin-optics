// lib/auth.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export const signToken = (userId: number, username: string) => {
  return jwt.sign({ userId, username }, SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET) as { userId: number; username: string };
};