import { NextRequest, NextResponse } from 'next/server';
import { getUsers, addUser, updateUser, deleteUser, saveUsersToDisk } from '@/lib/users';

// GET /api/users — list all users (admin only, but we'll check role in the handler)
export async function GET() {
  const users = getUsers();
  // Strip passwords from response
  const safe = users.map(({ password, ...rest }) => rest);
  return NextResponse.json(safe);
}

// POST /api/users — create a new user
export async function POST(request: NextRequest) {
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
      role: role || 'customer',
      company,
      phone,
    });

    await saveUsersToDisk();
    const { password: _, ...safe } = user;
    return NextResponse.json(safe, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PATCH /api/users — update a user
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = updateUser(id, updates);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await saveUsersToDisk();
    const { password: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users — delete a user
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const success = deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await saveUsersToDisk();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}