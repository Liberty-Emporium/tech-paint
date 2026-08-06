import { NextRequest, NextResponse } from 'next/server';
import { getUsers, addUser, updateUser, deleteUser } from '@/lib/users';
import { requirePermission } from '@/lib/require-auth';
import { Role, ALL_ROLES } from '@/lib/permissions';

function isRole(v: any): v is Role {
  return ALL_ROLES.includes(v);
}

// GET /api/users — list all users (owner only)
export async function GET() {
  const { error } = await requirePermission('users');
  if (error) return error;
  const users = getUsers();
  // Strip passwords from response
  const safe = users.map(({ password, ...rest }) => rest);
  return NextResponse.json(safe);
}

// POST /api/users — create a new user (owner only)
export async function POST(request: NextRequest) {
  const { error } = await requirePermission('users');
  if (error) return error;
  try {
    const body = await request.json();
    const { email, password, name, role, company, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    const existing = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const user = addUser({
      email,
      password,
      name,
      role: isRole(role) ? role : 'customer',
      company,
      phone,
    });

    const { password: _, ...safe } = user;
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PATCH /api/users — update a user (owner only)
export async function PATCH(request: NextRequest) {
  const { error } = await requirePermission('users');
  if (error) return error;
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (updates.role !== undefined && !isRole(updates.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = updateUser(id, updates);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users — delete a user (owner only)
export async function DELETE(request: NextRequest) {
  const { error } = await requirePermission('users');
  if (error) return error;
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const success = deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
