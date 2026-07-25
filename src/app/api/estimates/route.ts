import { NextRequest, NextResponse } from 'next/server';

declare global {
  // eslint-disable-next-line no-var
  var __estimates: Record<string, any> | undefined;
}
const store: Record<string, any> = global.__estimates || (global.__estimates = {});

export async function GET(request: NextRequest) {
  const estimates = Object.values(store);
  if (estimates.length === 0) {
    // Fall back to demo data so the UI isn't empty on first run.
    return NextResponse.json([
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
    ]);
  }
  return NextResponse.json(estimates);
}
