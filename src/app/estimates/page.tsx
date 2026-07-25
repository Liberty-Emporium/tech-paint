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

export default function EstimatesPage(): JSX.Element {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchEstimates = async (): Promise<void> => {
    try {
      const res = await fetch('/api/estimates');
      if (res.ok) {
        const data = await res.json();
        setEstimates(data);
      }
    } catch (error) {
      console.error('Failed to load estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const getStatusBadge = (status: string): JSX.Element => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Estimates</h1>
            <p className="text-gray-600">View and manage all your estimates</p>
          </div>
          <Link
            href="/estimates/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create Estimate
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search estimates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading estimates...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading estimates...</td>
                  </tr>
                ) : estimates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No estimates yet. <Link href="/estimates/new" className="text-blue-600 hover:text-blue-700 font-medium">Create your first estimate</Link>
                    </td>
                  </tr>
                ) : (
                  estimates
                    .filter(
                      (e) =>
                        e.customerName.toLowerCase().includes(search.toLowerCase()) ||
                        e.customerEmail.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((estimate) => (
                      <tr key={estimate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{estimate.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatCurrency(estimate.total)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            estimate.status === 'draft'
                              ? 'bg-gray-100 text-gray-700'
                              : estimate.status === 'sent'
                              ? 'bg-blue-100 text-blue-700'
                              : estimate.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(estimate.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/estimates/${estimate.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                            View
                          </Link>
                        </td>
                      </tr>
                    )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
