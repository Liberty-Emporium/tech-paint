import { NextRequest, NextResponse } from 'next/server';
import { all, remove } from '@/lib/db';

const DEMO_ESTIMATES = [
  {
    id: 'EST-abc123',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    total: 4787,
    status: 'accepted',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'EST-abc124',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    total: 3250,
    status: 'sent',
    createdAt: '2024-01-10T14:20:00Z',
  },
  {
    id: 'EST-abc125',
    customerName: 'Bob Wilson',
    customerEmail: 'bob@example.com',
    total: 2150,
    status: 'draft',
    createdAt: '2024-01-05T09:15:00Z',
  },
];

export async function GET(request: NextRequest) {
  const estimates = await all('estimates');
  // On a fresh install the DB is empty; show sample data so the UI isn't blank.
  if (estimates.length === 0) {
    return NextResponse.json(DEMO_ESTIMATES);
  }
  return NextResponse.json(estimates);
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const removed = await remove('estimates', id);
    return NextResponse.json({ success: removed });
  } catch (error) {
    console.error('Error deleting estimate:', error);
    return NextResponse.json({ error: 'Failed to delete estimate' }, { status: 500 });
  }
}
