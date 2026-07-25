import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // In a real app, you'd fetch from database
  // For now, return mock data
  const mockEstimates = [
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

  return NextResponse.json(mockEstimates);
}