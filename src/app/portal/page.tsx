'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Estimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  validUntil: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}

export default function CustomerPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role === 'admin') {
        router.push('/dashboard');
        return;
      }
      fetchEstimates();
    }
  }, [status, session]);

  const fetchEstimates = async () => {
    try {
      const res = await fetch('/api/estimates');
      if (res.ok) {
        const data = await res.json();
        // Filter to only this customer's estimates
        const myEmail = session?.user?.email?.toLowerCase();
        const mine = data.filter((e: Estimate) => e.customerEmail?.toLowerCase() === myEmail);
        setEstimates(mine);
      }
    } catch (err) {
      console.error('Failed to load estimates:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusColor = (s: string) => {
    const m: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
    };
    return m[s] || 'bg-gray-100 text-gray-700';
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading your account…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Estimates & Invoices</h1>
          <p className="text-gray-600">
            Welcome, <strong>{session?.user?.name || session?.user?.email}</strong>. View and download your painting estimates below.
          </p>
        </div>

        {estimates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Estimates Yet</h2>
            <p className="text-gray-600">You don&apos;t have any estimates on file. Your contractor will send them to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {estimates.map((est) => (
              <div key={est.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{est.estimateNumber || est.id}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(est.status)}`}>
                        {est.status.charAt(0).toUpperCase() + est.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Created {formatDate(est.createdAt)} • Valid until {formatDate(est.validUntil)}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {est.items?.length || 0} line items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(est.total)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/invoice/${est.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        📄 View & Download
                      </Link>
                    </div>
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