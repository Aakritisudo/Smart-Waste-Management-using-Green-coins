import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { secret } from './secrets';

export const COOKIE = 'gc_session';
const key = () => new TextEncoder().encode(secret('JWT_SECRET', 'dev-only-jwt-secret'));

export async function createSession(user) {
  const token = await new SignJWT({ phone: user.phone }).setSubject(user.id).setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt().setExpirationTime('7d').sign(key());
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 3600 });
}
export async function getSession() {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  try { return (await jwtVerify(t, key())).payload; } catch { return null; }
}
export const clearSession = () => cookies().set(COOKIE, '', { path: '/', maxAge: 0 });
