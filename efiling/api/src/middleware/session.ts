import session from 'express-session';
import { randomBytes } from 'node:crypto';
declare module 'express-session' { interface SessionData { userId: string } }
export function demoSession() {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo authentication is disabled in production');
  return session({
    name: 'efiling.sid', secret: randomBytes(32).toString('hex'), resave: false, saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'strict', secure: false, maxAge: 8 * 60 * 60 * 1000 },
  });
}
