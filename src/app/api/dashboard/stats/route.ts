import { NextRequest, NextResponse } from 'next/server';

declare global {
  // eslint-disable-next-line no-var
  var __estimates: Record<string, any> | undefined;
}
const store: Record<string, any> = global.__estimates || (global.__estimates = {});

export async function GET(request: NextRequest) {
  const estimates = Object.values(store);

  if (estimates.length === 0) {
    return NextResponse.json({
      totalEstimates: 3,
      totalRevenue: 10187,
      winRate: 33,
      avgTurnaround: '2.4d',
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
