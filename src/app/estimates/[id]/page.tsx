'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Estimate {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  propertyDescription: string;
  roomType: string;
  squareFootage: string;
  notes: string;
  photos: string[];
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  total: number;
  createdAt: string;
  updatedAt: string;
  estimateNumber: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  validUntil: string;
}

export default function EstimateDetailPage() {
  const params = useParams();
  const estimateId = params.id as string;
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const fetchEstimate = async () => {
    try {
      const res = await fetch(`/api/estimates/${estimateId}`);
      if (res.ok) {
        const data = await res.json();
        setEstimate(data);
      } else {
        setError('Estimate not found');
      }
    } catch (err) {
      setError('Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [estimateId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700'
    };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleSendEstimate = async () => {
    if (!estimate) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_estimate',
          to: estimate.customerEmail,
          estimateId: estimate.id,
          template: 'estimate_sent'
        })
      });
      
      const data = await res.json();
      if (data.success) {
        // Update estimate status
        setEstimate(prev => prev ? { ...prev, status: 'sent' } : null);
        alert('Estimate sent successfully!');
      } else {
        alert('Failed to send estimate: ' + data.error);
      }
    } catch (err) {
      alert('Failed to send estimate');
    } finally {
      setSending(false);
    }
  };

  const handleSendToDocuSign = async () => {
    if (!estimate) return;
    
    setSending(true);
    try {
      const res = await fetch('/api/docusign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_envelope',
          estimateId: estimate.id,
          customerEmail: estimate.customerEmail,
          customerName: estimate.customerName
        })
      });
      
      const data = await res.json();
      if (data.envelopeId) {
        alert('DocuSign envelope created! Check your email to sign.');
      } else {
        alert('Failed to create DocuSign envelope');
      }
    } catch (err) {
      alert('Failed to create DocuSign envelope');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center py-12 text-gray-500">Loading estimate…</div>
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Estimate Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The estimate you\'re looking for doesn\'t exist.'}</p>
          <Link href="/estimates" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Estimates
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = estimate.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Estimate {estimate.estimateNumber}</h1>
            <p className="text-gray-600">Created {formatDate(estimate.createdAt)} • Valid until {formatDate(estimate.validUntil)}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/estimates"
              className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Estimates
            </Link>
            <span className="px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium self-end">
              {getStatusBadge(estimate.status)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h18a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{estimate.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{estimate.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium text-gray-900">{estimate.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium text-gray-900">{estimate.customerAddress}</p>
                </div>
              </div>
            </div>

            {/* Estimate Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Estimate Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {estimate.items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                          No items yet. <a href="#" className="text-blue-600 hover:text-blue-700">Generate estimate with AI</a>
                        </td>
                      </tr>
                    ) : (
                      estimate.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-900">{item.description}</p>
                          </td>
                          <td className="px-4 py-4 text-center text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-4 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-4 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex justify-end space-x-8">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v18a2 2 0 002 2h10a2 2 0 002-2V9.414l3 3M9 9a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V9z" />
                </svg>
                Property Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Room / Area Type</p>
                  <p className="font-medium text-gray-900">{estimate.roomType || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Square Footage</p>
                  <p className="font-medium text-gray-900">{estimate.squareFootage ? estimate.squareFootage + ' sq ft' : 'Not specified'}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Property Description</p>
                <p className="text-gray-900 whitespace-pre-wrap">{estimate.propertyDescription}</p>
              </div>
              {estimate.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Notes / Special Requests</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{estimate.notes}</p>
                </div>
              )}
            </div>

            {/* Photos */}
            {estimate.photos && estimate.photos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0l6 6a2 2 0 010 2.828L12 22.5l7.586-7.586a2 2 0 000-2.828l-8-8a2 2 0 00-2.828 0l-6 6a2 2 0 000 2.828z" />
                  </svg>
                  Project Photos
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {estimate.photos.map((photo, i) => (
                    <div key={i} className="relative group">
                      <img src={photo} alt={`Project photo ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {estimate.status === 'draft' && (
                  <>
                    <button
                      onClick={handleSendToDocuSign}
                      disabled={sending}
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {sending ? 'Sending…' : '📝 Send to DocuSign'}
                    </button>
                    <button
                      onClick={handleSendEstimate}
                      disabled={sending}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {sending ? 'Sending…' : '📧 Send via Email'}
                    </button>
                  </>
                )}
                {estimate.status === 'sent' && (
                  <button
                    onClick={handleSendToDocuSign}
                    disabled={sending}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {sending ? 'Sending…' : '📝 Send to DocuSign'}
                  </button>
                )}
                {estimate.status === 'accepted' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">✅ Estimate Accepted!</p>
                    <p className="text-sm text-green-700">The client has signed the estimate. You can now schedule the work.</p>
                  </div>
                )}
                {estimate.status === 'declined' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">❌ Estimate Declined</p>
                    <p className="text-sm text-red-700">The client has declined this estimate.</p>
                  </div>
                )}

                <hr className="my-4 border-gray-200" />

                <a
                  href={`/api/documents/generate-pdf?estimateId=${estimate.id}`}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Download PDF
                </a>

                <a
                  href={`/documents/new?estimateId=${estimate.id}`}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                >
                  📁 Upload Document
                </a>

                <Link
                  href={`/estimates/${estimate.id}/edit`}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                >
                  ✏️ Edit Estimate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}