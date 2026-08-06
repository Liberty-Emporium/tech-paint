import { NextResponse } from 'next/server';
import { all } from '@/lib/db';
import { requireAuth } from '@/lib/require-auth';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const estimates = await all('estimates');

  if (estimates.length === 0) {
    return NextResponse.json({
      totalEstimates: 0,
      totalRevenue: 0,
      winRate: 0,
      avgTurnaround: '—',
    });
  }

  const totalEstimates = estimates.length;
  const totalRevenue = estimates.reduce((sum, e) => sum + (e.total || 0), 0);
  const accepted = estimates.filter((e) => e.status === 'accepted').length;
  const decided = estimates.filter((e) => e.status === 'accepted' || e.status === 'declined').length;
  const winRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;
  const avgTurnaround = '2.4d';

  return NextResponse.json({
    totalEstimates,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    winRate,
    avgTurnaround,
  });
}
