'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalEstimates: number;
  totalRevenue: number;
  winRate: number;
  avgTurnaround: string;
}

const statCards = [
  { key: 'totalEstimates', label: 'Total Estimates', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 12l2 2 4-4', tint: 'from-brand-500 to-violet-500' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', tint: 'from-emerald-500 to-teal-500' },
  { key: 'winRate', label: 'Win Rate', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', tint: 'from-violet-500 to-fuchsia-500' },
  { key: 'avgTurnaround', label: 'Avg Turnaround', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', tint: 'from-amber-500 to-orange-500' },
];

export default function DashboardPage(): JSX.Element {
  const [stats, setStats] = useState<Stats>({ totalEstimates: 0, totalRevenue: 0, winRate: 0, avgTurnaround: '0h' });
  const [recentEstimates, setRecentEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      const [statsRes, estimatesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/estimates?limit=10'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (estimatesRes.ok) setRecentEstimates(await estimatesRes.json());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally { setLoading(false); }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusStyles: Record<string, string> = {
    draft: 'badge-gray', sent: 'badge-blue', accepted: 'badge-green', declined: 'badge-red',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-sm font-medium text-ink-500">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <span className="section-eyebrow">Overview</span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">Dashboard</h1>
            <p className="mt-1.5 text-ink-600">A snapshot of your painting business.</p>
          </div>
          <Link href="/estimates/new" className="btn btn-primary btn-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Estimate
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.key} className="card card-hover p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">{card.label}</p>
                <p className="stat-value mt-1.5">
                  {card.key === 'totalRevenue'
                    ? formatCurrency(stats.totalRevenue)
                    : card.key === 'avgTurnaround' ? stats.avgTurnaround
                    : card.key === 'winRate' ? `${stats.winRate}%`
                    : stats.totalEstimates}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.tint} flex items-center justify-center shadow-lift`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Recent estimates */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-ink-100">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">Recent Estimates</h2>
              <p className="text-sm text-ink-500 mt-0.5">Your latest activity</p>
            </div>
            <Link href="/estimates" className="btn btn-soft btn-sm">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-shell">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="!text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentEstimates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="!py-14 text-center">
                      <div className="text-4xl mb-3">🎨</div>
                      <p className="text-ink-500 mb-1">No estimates yet.</p>
                      <Link href="/estimates/new" className="btn btn-primary btn-sm mt-2">Create your first estimate</Link>
                    </td>
                  </tr>
                ) : (
                  recentEstimates.map((estimate) => (
                    <tr key={estimate.id}>
                      <td className="font-semibold text-ink-900">{estimate.customerName}</td>
                      <td className="font-medium">{formatCurrency(estimate.total)}</td>
                      <td>
                        <span className={statusStyles[estimate.status] || 'badge-gray'}>
                          {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(estimate.createdAt)}</td>
                      <td className="!text-right">
                        <Link href={`/estimates/${estimate.id}`} className="text-brand-600 hover:text-brand-700 font-semibold">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
