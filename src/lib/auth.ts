import { db } from './db';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'olms-secret-key-2024';

export async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex');
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

export async function createToken(userId: string, username: string, role: string): Promise<string> {
  const encoder = new TextEncoder();
  const secret = encoder.encode(SECRET_KEY);
  
  return await new SignJWT({ userId, username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ userId: string; username: string; role: string } | null> {
  try {
    const encoder = new TextEncoder();
    const secret = encoder.encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; username: string; role: string };
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return null;
    
    const payload = await verifyToken(token);
    if (!payload) return null;
    
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        branchId: true,
      }
    });
    
    return user;
  } catch {
    return null;
  }
}

export async function initializeAdminUser() {
  const existingAdmin = await db.user.findUnique({
    where: { username: 'admin' }
  });
  
  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin');
    await db.user.create({
      data: {
        username: 'admin',
        email: 'admin@olms.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      }
    });
  }
}
