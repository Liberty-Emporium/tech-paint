import { NextRequest, NextResponse } from 'next/server';
import { all, insert } from '@/lib/db';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  createdAt: string;
}

export async function GET() {
  const customers = await all<Customer>('customers');
  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 });
    }
    const customer = await insert<Customer>('customers', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address || '',
      company: body.company || '',
      createdAt: new Date().toISOString(),
    } as Customer);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
