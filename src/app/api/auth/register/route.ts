import { NextRequest, NextResponse } from 'next/server';
import { addUser, getUserByEmail, saveUsersToDisk } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, address, company } = body;

    if (!email || !password || !name || !phone) {
      return NextResponse.json({ error: 'Email, password, name, and phone are required' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const user = addUser({
      email,
      password,
      name,
      phone,
      address: address || '',
      company: company || '',
      role: 'customer',
    });

    await saveUsersToDisk();

    const { password: _, ...safe } = user;
    return NextResponse.json({ success: true, user: safe }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
