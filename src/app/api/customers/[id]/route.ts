import { NextRequest, NextResponse } from 'next/server';
import { findById, update, remove } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const customer = await findById('customers', params.id);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
  return NextResponse.json(customer);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = await findById('customers', params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    const updated = await update('customers', params.id, {
      name: body.name ?? existing.name,
      email: body.email ?? existing.email,
      phone: body.phone ?? existing.phone,
      address: body.address !== undefined ? body.address : existing.address,
      company: body.company !== undefined ? body.company : existing.company,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const removed = await remove('customers', params.id);
  if (!removed) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
