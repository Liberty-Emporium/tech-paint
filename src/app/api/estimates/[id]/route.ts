import { NextRequest, NextResponse } from 'next/server';

// In-memory store so the demo flow works end-to-end without a database.
// Shape mirrors the estimate created by /api/estimates/generate.
declare global {
  // eslint-disable-next-line no-var
  var __estimates: Record<string, any> | undefined;
}
const store: Record<string, any> = global.__estimates || (global.__estimates = {});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const est = store[params.id];
  if (!est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  return NextResponse.json(est);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => ({}));
  const est = store[params.id];
  if (!est) {
    return NextResponse.json({ error: 'Estimate not found' }, { status: 404 });
  }
  if (body.status) est.status = body.status;
  if (body.total !== undefined) est.total = body.total;
  store[params.id] = est;
  return NextResponse.json(est);
}
