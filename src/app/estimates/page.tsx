'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Estimate {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  draft: 'badge-gray', sent: 'badge-blue', accepted: 'badge-green', declined: 'badge-red',
};

export default function EstimatesPage(): JSX.Element {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEstimates = async (): Promise<void> => {
    try {
      const res = await fetch('/api/estimates');
      if (res.ok) setEstimates(await res.json());
    } catch (error) {
      console.error('Failed to load estimates:', error);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEstimates(); }, []);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filtered = estimates.filter(
    (e) => e.customerName.toLowerCase().includes(search.toLowerCase()) ||
           e.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: estimates.length,
    accepted: estimates.filter(e => e.status === 'accepted').length,
    sent: estimates.filter(e => e.status === 'sent').length,
    draft: estimates.filter(e => e.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 animate-fade-up">
          <div>
            <span className="section-eyebrow">Proposals</span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">Estimates</h1>
            <p className="mt-1.5 text-ink-600">View and manage all your estimates</p>
          </div>
          <Link href="/estimates/new" className="btn btn-primary btn-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Estimate
          </Link>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="card px-5 py-3"><span className="font-display text-xl font-bold text-ink-900">{counts.total}</span> <span className="text-sm text-ink-500 ml-1.5">Total</span></div>
          <div className="card px-5 py-3"><span className="font-display text-xl font-bold text-emerald-600">{counts.accepted}</span> <span className="text-sm text-ink-500 ml-1.5">Accepted</span></div>
          <div className="card px-5 py-3"><span className="font-display text-xl font-bold text-brand-600">{counts.sent}</span> <span className="text-sm text-ink-500 ml-1.5">Sent</span></div>
          <div className="card px-5 py-3"><span className="font-display text-xl font-bold text-ink-400">{counts.draft}</span> <span className="text-sm text-ink-500 ml-1.5">Draft</span></div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <svg className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search estimates…" value={search}
            onChange={(e) => setSearch(e.target.value)} className="input !pl-10" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden">
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="!py-14 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-ink-500 mb-2">No estimates {search ? 'matching your search' : 'yet'}.</p>
                        {!search && <Link href="/estimates/new" className="btn btn-primary btn-sm mt-2">Create your first estimate</Link>}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((estimate) => (
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
                          <Link href={`/estimates/${estimate.id}`} className="btn btn-soft btn-sm">
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
        )}
      </div>
    </div>
  );
}
