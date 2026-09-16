'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';
import { sanitizeString } from '@/lib/security/sanitization';
import { recordFailedLogin, resetFailedLogin, isAccountLocked } from '@/lib/security/lockout';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  loginAt: string;
}

// In-memory active online session cache (simulated server store)
const activeOnlineSessions = new Map<string, UserSession>();

/**
 * Log in User & Create Active Online Session
 */
export async function loginUserAction(data: { email: string; passKey: string }) {
  try {
    const cleanEmail = sanitizeString(data.email).toLowerCase();
    const passKey = data.passKey;

    // Check account lockout status (NIST 800-63B)
    const locked = isAccountLocked(cleanEmail);
    if (locked) {
      return {
        success: false,
        error: `บัญชีถูกระงับชั่วคราวเนื่องจากใส่รหัสผ่านผิดเกินกำหนด กรุณาลองใหม่อีกครั้งในภายหลัง`,
      };
    }

    // Special quick master accounts mapping for demo / clinic roles
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { email: `${cleanEmail}@klinik.local` }],
      },
    });

    if (!user) {
      // Fallback create user for standard roles if not present
      if (cleanEmail === 'admin' || cleanEmail === 'tomvis') {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail === 'tomvis' ? 'Tomvis License Admin' : 'System Administrator',
            passwordHash: 'hash',
            role: 'ADMIN',
          },
        });
      } else if (cleanEmail.includes('doctor')) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: 'Dr. Somchai Jaidee',
            passwordHash: 'hash',
            role: 'DOCTOR',
          },
        });
      } else if (cleanEmail.includes('nurse')) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: 'Nurse Suda Care',
            passwordHash: 'hash',
            role: 'NURSE',
          },
        });
      } else if (cleanEmail.includes('pharm')) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: 'Pharm. Viroj Medicine',
            passwordHash: 'hash',
            role: 'PHARMACIST',
          },
        });
      }
    }

    if (!user) {
      recordFailedLogin(cleanEmail);
      return { success: false, error: 'ไม่พบชื่อผู้ใช้หรือรหัสผ่านในระบบ' };
    }

    resetFailedLogin(cleanEmail);

    const session: UserSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginAt: new Date().toISOString(),
    };

    // Register active online presence
    activeOnlineSessions.set(user.id, session);

    // Set HttpOnly session cookie
    cookies().set('tomvis_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 Minutes
    });

    // Record Audit Log for login event
    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      resource: `User:${user.email}`,
      details: { role: user.role, name: user.name, time: session.loginAt },
    });

    return { success: true, user: session };
  } catch (error: any) {
    console.error('Error logging in:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  }
}

/**
 * Log out User & Audit Event
 */
export async function logoutUserAction() {
  try {
    const sessionCookie = cookies().get('tomvis_session');
    if (sessionCookie) {
      const session: UserSession = JSON.parse(sessionCookie.value);
      activeOnlineSessions.delete(session.userId);

      await logAudit({
        userId: session.userId,
        action: 'USER_LOGOUT',
        resource: `User:${session.email}`,
        details: { logoutTime: new Date().toISOString() },
      });
    }

    cookies().delete('tomvis_session');
    return { success: true };
  } catch (error: any) {
    return { success: true };
  }
}

/**
 * Get Current Logged In Session
 */
export async function getCurrentSessionAction(): Promise<UserSession | null> {
  const sessionCookie = cookies().get('tomvis_session');
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch (e) {
    return null;
  }
}

/**
 * Get Active Online Users List (สำหรับแสดงสถานะใครกำลัง Online อยู่)
 */
export async function getOnlineUsersAction(): Promise<{ success: boolean; onlineUsers: UserSession[] }> {
  // If activeOnlineSessions is empty, populate default active staff for demonstration
  if (activeOnlineSessions.size === 0) {
    const defaultStaff: UserSession[] = [
      { userId: 'u-admin', email: 'admin@klinik.local', name: 'System Administrator', role: 'ADMIN', loginAt: new Date().toISOString() },
      { userId: 'u-doctor', email: 'doctor.somchai@klinik.local', name: 'Dr. Somchai Jaidee', role: 'DOCTOR', loginAt: new Date().toISOString() },
      { userId: 'u-nurse', email: 'nurse.suda@klinik.local', name: 'Nurse Suda Care', role: 'NURSE', loginAt: new Date().toISOString() },
    ];
    defaultStaff.forEach((s) => activeOnlineSessions.set(s.userId, s));
  }

  const onlineUsers = Array.from(activeOnlineSessions.values());
  return { success: true, onlineUsers };
}
