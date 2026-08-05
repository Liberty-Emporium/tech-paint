import { NextRequest, NextResponse } from 'next/server';
import { findById, update } from '@/lib/db';
import { requireAuth } from '@/lib/require-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const est = await findById('estimates', params.id);
  if (!est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  return NextResponse.json(est);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => ({}));
  const est = await findById('estimates', params.id);
  if (!est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  const updates: any = { updatedAt: new Date().toISOString() };
  if (body.status) updates.status = body.status;
  if (body.total !== undefined) updates.total = body.total;
  if (body.items) updates.items = body.items;
  const updated = await update('estimates', params.id, updates);
  return NextResponse.json(updated);
}
