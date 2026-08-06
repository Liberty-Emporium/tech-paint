'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Estimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  roomType: string;
  squareFootage: string;
  propertyDescription: string;
  notes: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdAt: string;
  validUntil: string;
  items: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
  photos?: string[];
  signature?: { signerName: string; signedAt: string };
}

export default function EstimateDetailPage({ params }: { params: { id: string } }): JSX.Element {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/estimates/${params.id}`);
        if (res.ok) setEstimate(await res.json());
        else { const d = await res.json(); setError(d.error || 'Estimate not found'); }
      } catch (e) { setError('Failed to load estimate'); }
      finally { setLoading(false); }
    };
    load();
  }, [params.id]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusStyles: Record<string, string> = {
    draft: 'badge-gray', sent: 'badge-blue', accepted: 'badge-green', declined: 'badge-red',
  };

  const handleSendEstimate = async () => {
    if (!estimate) return;
    setSending(true);
    try {
      const res = await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send_estimate', to: estimate.customerEmail, estimateId: estimate.id, template: 'estimate_sent' }) });
      const data = await res.json();
      if (data.success) { setEstimate(prev => prev ? { ...prev, status: 'sent' } : null); alert('Estimate sent successfully!'); }
      else alert('Failed to send estimate: ' + data.error);
    } catch (err) { alert('Failed to send estimate'); }
    finally { setSending(false); }
  };

  const handleSendForSignature = async () => {
    if (!estimate) return;
    setSending(true);
    try {
      // Mark as sent so it's tracked as awaiting signature.
      await fetch(`/api/estimates/${estimate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' }),
      });
      const signUrl = `${window.location.origin}/sign/${estimate.id}`;
      setEstimate(prev => prev ? { ...prev, status: 'sent' } : null);

      // Try to email the signing link if SMTP is configured.
      let emailed = false;
      try {
        const eRes = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: estimate.customerEmail,
            subject: `Your estimate ${estimate.estimateNumber} is ready to sign`,
            html: `<p>Hi ${estimate.customerName},</p><p>Your painting estimate <strong>${estimate.estimateNumber}</strong> is ready for review and electronic signature.</p><p><a href="${signUrl}" style="background:#3d6cff;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:8px 0">Review & Sign Estimate</a></p><p>Coltrane Tech Paint</p>`,
          }),
        });
        const d = await eRes.json();
        emailed = d.success === true;
      } catch { /* email not configured — fine */ }

      if (emailed) {
        alert('Signing link sent to ' + estimate.customerEmail + '. Check your SMTP/email to confirm delivery.');
      } else {
        // Copy the link so the contractor can send it any way they like.
        try {
          await navigator.clipboard.writeText(signUrl);
          alert(`Signing link copied to clipboard — send it to ${estimate.customerName}. (Email isn't configured yet.)`);
        } catch {
          alert(`Signing link ready. Send this to the customer: ${signUrl}  (Email isn't configured yet.)`);
        }
      }
    } catch (err) {
      alert('Failed to prepare the estimate for signing.');
    } finally { setSending(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-10 text-center animate-fade-up">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="font-display text-2xl font-bold text-ink-900 mb-2">Estimate Not Found</h1>
          <p className="text-ink-600 mb-6">{error || "The estimate you're looking for doesn't exist."}</p>
          <Link href="/estimates" className="btn btn-primary btn-md">Back to Estimates</Link>
        </div>
      </div>
    );
  }

  const subtotal = estimate.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const status = estimate.status;

  return (
    <div className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 animate-fade-up">
          <div>
            <Link href="/estimates" className="text-sm text-ink-500 hover:text-brand-600 transition-colors">← Back to estimates</Link>
            <h1 className="mt-1 font-display text-3xl font-extrabold text-ink-950">Estimate {estimate.estimateNumber}</h1>
            <p className="mt-1.5 text-ink-600">Created {formatDate(estimate.createdAt)} • Valid until {formatDate(estimate.validUntil)}</p>
          </div>
          <span className={statusStyles[status] || 'badge-gray'}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer card */}
            <div className="card p-7">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  ['Name', estimate.customerName],
                  ['Email', estimate.customerEmail],
                  ['Phone', estimate.customerPhone],
                  ['Address', estimate.customerAddress],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-sm text-ink-500 mb-1">{label}</p>
                    <p className="font-semibold text-ink-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="card overflow-hidden">
              <div className="px-7 pt-6 pb-0">
                <h2 className="font-display text-lg font-bold text-ink-900">Estimate Items</h2>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="table-shell">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="!text-center">Qty</th>
                      <th className="!text-right">Unit Price</th>
                      <th className="!text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="!py-12 text-center text-ink-500">
                          No items yet. <Link href="/estimates/new" className="text-brand-600 font-medium">Generate estimate with AI</Link>
                        </td>
                      </tr>
                    ) : (
                      estimate.items.map((item) => (
                        <tr key={item.id}>
                          <td className="font-medium text-ink-900">{item.description}</td>
                          <td className="!text-center">{item.quantity}</td>
                          <td className="!text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="!text-right font-semibold text-ink-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Totals */}
              <div className="px-7 py-6 border-t border-ink-100 bg-ink-50/40">
                <div className="max-w-xs ml-auto space-y-2.5">
                  <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-ink-600"><span>Tax (8%)</span><span>{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between border-t border-ink-200 pt-3">
                    <span className="font-display font-bold text-ink-900">Total</span>
                    <span className="font-display font-bold text-xl text-gradient">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Property details */}
            <div className="card p-7">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </span>
                Property Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[['Room / Area Type', estimate.roomType || 'Not specified'], ['Square Footage', estimate.squareFootage ? estimate.squareFootage + ' sq ft' : 'Not specified']].map(([label, value]) => (
                  <div key={label}><p className="text-sm text-ink-500 mb-1">{label}</p><p className="font-semibold text-ink-900">{value}</p></div>
                ))}
              </div>
              {estimate.propertyDescription && (
                <div className="mt-4"><p className="text-sm text-ink-500 mb-1">Property Description</p><p className="text-ink-900 whitespace-pre-wrap">{estimate.propertyDescription}</p></div>
              )}
              {estimate.notes && (
                <div className="mt-4"><p className="text-sm text-ink-500 mb-1">Notes / Special Requests</p><p className="text-ink-900 whitespace-pre-wrap">{estimate.notes}</p></div>
              )}
            </div>

            {/* Photos */}
            {estimate.photos && estimate.photos.length > 0 && (
              <div className="card p-7">
                <h2 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </span>
                  Project Photos
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {estimate.photos.map((photo, i) => (
                    <img key={i} src={photo} alt={`Project photo ${i + 1}`} className="w-full h-24 object-cover rounded-xl border border-ink-100" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {status === 'draft' && (
                  <>
                    <button onClick={handleSendForSignature} disabled={sending}
                      className="btn btn-md w-full !py-3 text-white disabled:opacity-50 hover:-translate-y-0.5"
                      style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                      {sending ? 'Sending…' : '✍️ Send for Signature'}
                    </button>
                    <button onClick={handleSendEstimate} disabled={sending} className="btn btn-primary btn-md w-full !py-3 disabled:opacity-50">
                      {sending ? 'Sending…' : '📧 Send via Email'}
                    </button>
                  </>
                )}
                {status === 'sent' && (
                  <div className="space-y-3">
                    <div className="badge-blue w-full justify-start py-3 px-4 !text-sm !font-normal">
                      <p className="font-semibold">Sent for signature</p>
                      <p className="text-blue-600 text-sm mt-0.5">The customer can sign at <span className="font-mono text-xs underline">/sign/{estimate.id}</span></p>
                    </div>
                    <Link href={`/sign/${estimate.id}`} target="_blank" rel="noopener noreferrer"
                      className="btn btn-md w-full !py-3" style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff' }}>
                      Open Signing Page →
                    </Link>
                  </div>
                )}
                {status === 'accepted' && (
                  <div className="space-y-3">
                    <div className="badge-green w-full justify-start py-3 px-4 !text-sm !font-normal">
                      <div>
                        <p className="font-semibold mb-1">✅ Estimate Accepted!</p>
                        <p className="text-emerald-700 text-sm">
                          Signed by {estimate.signature?.signerName || 'the client'}
                          {estimate.signature?.signedAt ? ` on ${new Date(estimate.signature.signedAt).toLocaleDateString()}` : ''}. You can schedule the work.
                        </p>
                      </div>
                    </div>
                    <Link href={`/sign/${estimate.id}`} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost btn-md w-full">📄 View / Download Signed Copy</Link>
                  </div>
                )}
                {status === 'declined' && (
                  <div className="badge-red w-full justify-start py-3 px-4 !text-sm !font-normal">
                    <p className="font-semibold">❌ Estimate Declined</p>
                  </div>
                )}

                <hr className="my-4 border-ink-100" />

                <a href={`/api/documents/generate-pdf?estimateId=${estimate.id}`} target="_blank" rel="noopener noreferrer"
                  className="btn btn-ghost btn-md w-full">📄 Download PDF</a>
                <Link href={`/documents?estimateId=${estimate.id}`} className="btn btn-ghost btn-md w-full">📁 View Documents</Link>
                <Link href={`/estimates/new?copy=${estimate.id}`} className="btn btn-ghost btn-md w-full">✏️ Create Similar</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
