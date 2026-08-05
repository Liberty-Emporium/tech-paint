// API route guard helpers — require an authenticated session and optionally a role.
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import { Role, Permission, hasPermission } from './permissions';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Returns the session user, or null if not authenticated. */
export async function getAuthUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || !user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: (user.role as Role) || 'customer',
  };
}

/** Require login. Returns { user, error } — callers should return `error` if non-null. */
export async function requireAuth(): Promise<{ user: SessionUser; error: NextResponse | null }> {
  const user = await getAuthUser();
  if (!user) {
    return { user: null as any, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, error: null };
}

/** Require login AND a specific permission/role. */
export async function requirePermission(
  permission: Permission
): Promise<{ user: SessionUser; error: NextResponse | null }> {
  const user = await getAuthUser();
  if (!user) {
    return { user: null as any, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!hasPermission(user.role, permission)) {
    return { user, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user, error: null };
}
