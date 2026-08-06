'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PortalPage() {
  const { data: session, status } = useSession();
  const [estimates, setEstimates] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchEstimates = async () => {
        try {
          const res = await fetch('/api/estimates');
          if (res.ok) {
            const data = await res.json();
            const myEmail = session?.user?.email?.toLowerCase();
            setEstimates(data.filter((e: any) => e.customerEmail?.toLowerCase() === myEmail));
          }
        } catch (e) { console.error(e); }
      };
      fetchEstimates();
    }
  }, [status, session]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const statusColor = (s: string) => ({ draft: 'badge-gray', sent: 'badge-blue', accepted: 'badge-green', declined: 'badge-red' }[s] || 'badge-gray');

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <span className="section-eyebrow">Client Portal</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">My Estimates & Invoices</h1>
          <p className="mt-1.5 text-ink-600">
            Welcome, <strong className="text-ink-900">{session?.user?.name || session?.user?.email}</strong>. View and download your painting estimates below.
          </p>
        </div>

        {estimates.length === 0 ? (
          <div className="card p-14 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">No Estimates Yet</h2>
            <p className="text-ink-600">You don&apos;t have any estimates on file. Your contractor will send them to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {estimates.map((est) => (
              <div key={est.id} className="card card-hover p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-lg font-bold text-ink-900">{est.estimateNumber || est.id}</h3>
                      <span className={statusColor(est.status)}>{est.status.charAt(0).toUpperCase() + est.status.slice(1)}</span>
                    </div>
                    <p className="text-ink-600 text-sm">Created {formatDate(est.createdAt)} • Valid until {formatDate(est.validUntil)}</p>
                    <p className="text-ink-500 text-sm mt-1">{est.items?.length || 0} line items</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-display text-2xl font-bold text-gradient">{formatCurrency(est.total)}</div>
                    <Link href={`/invoice/${est.id}`} className="btn btn-primary btn-md">
                      📄 View & Download
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
