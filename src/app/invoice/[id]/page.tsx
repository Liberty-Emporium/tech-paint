'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Estimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  propertyDescription: string;
  roomType: string;
  squareFootage: string;
  notes: string;
  status: string;
  total: number;
  items: EstimateItem[];
  validUntil: string;
  createdAt: string;
}

export default function InvoicePage() {
  const params = useParams();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/estimates/${params.id}`);
        if (res.ok) {
          setEstimate(await res.json());
        } else {
          setError('Invoice not found');
        }
      } catch {
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-500">Loading invoice…</p></div>;
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">{error || 'Invoice not found'}</p>
          <Link href="/portal" className="text-blue-600 hover:underline">← Back to portal</Link>
        </div>
      </div>
    );
  }

  const subtotal = estimate.items.reduce((s, i) => s + i.total, 0);
  const tax = subtotal * 0.08;

  return (
    <>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .invoice-page { padding: 0; background: white; }
          @page { margin: 0.5in; }
        }
      `}} />

      <div className="invoice-page min-h-screen bg-ink-50 print:bg-white">
        {/* Top bar — hidden when printing */}
        <div className="no-print bg-white border-b border-ink-100 px-4 py-3 flex items-center justify-between">
          <Link href="/portal" className="text-brand-600 hover:text-brand-700 text-sm font-medium">← Back to portal</Link>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="btn btn-primary btn-sm !py-2.5">
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="max-w-4xl mx-auto bg-white my-8 print:my-0 print:shadow-none shadow-lg rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-10 py-8 text-white" style={{ backgroundImage: 'linear-gradient(120deg, #2949f5, #7c3aed)' }}>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Coltrane Tech Paint</h1>
                <p className="text-white/80 mt-1">Professional Painting Estimates & Invoices</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold">INVOICE</p>
                <p className="text-white/80 mt-1">{estimate.estimateNumber || estimate.id}</p>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="px-10 py-4 bg-ink-50 border-b border-ink-100 flex justify-between items-center">
            <div>
              <span className={`badge ${
                estimate.status === 'accepted' ? 'badge-green' :
                estimate.status === 'sent' ? 'badge-blue' :
                estimate.status === 'declined' ? 'badge-red' : 'badge-gray'
              }`}>
                {estimate.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-ink-500">
              Issued: {fmtDate(estimate.createdAt)} &nbsp;|&nbsp; Valid until: {fmtDate(estimate.validUntil)}
            </div>
          </div>


          {/* Body */}
          <div className="px-10 py-8">
            {/* Bill To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                <p className="font-semibold text-gray-900 text-lg">{estimate.customerName}</p>
                <p className="text-gray-600">{estimate.customerEmail}</p>
                <p className="text-gray-600">{estimate.customerPhone}</p>
                <p className="text-gray-600">{estimate.customerAddress}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Project Details</h3>
                <p className="text-gray-700">{estimate.propertyDescription}</p>
                {estimate.roomType && <p className="text-gray-600 mt-1">Type: {estimate.roomType}</p>}
                {estimate.squareFootage && <p className="text-gray-600">Area: {estimate.squareFootage} sq ft</p>}
                {estimate.notes && <p className="text-gray-500 mt-2 text-sm italic">Note: {estimate.notes}</p>}
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="text-center py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Qty</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Unit Price</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">{item.description}</td>
                    <td className="py-3 text-center text-gray-600">{item.quantity.toLocaleString()}</td>
                    <td className="py-3 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium text-gray-900">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72">
                <div className="flex justify-between py-2 text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-600">
                  <span>Tax (8%)</span>
                  <span>{fmt(tax)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-800 mt-2">
                  <span className="text-xl font-bold text-gray-900">Total Due</span>
                  <span className="text-xl font-bold text-blue-700">{fmt(estimate.total || subtotal + tax)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-10 py-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p className="font-medium text-gray-700">Coltrane Tech Paint</p>
            <p>Thank you for your business! This estimate is valid for 30 days from the issue date.</p>
          </div>
        </div>
      </div>
    </>
  );
}