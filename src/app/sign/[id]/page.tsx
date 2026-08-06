'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';

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
  status: string;
  validUntil: string;
  createdAt: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  signature?: { signerName: string; signedAt: string };
}

export default function SignPage({ params }: { params: { id: string } }): JSX.Element {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const signerName = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [signError, setSignError] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signedAt, setSignedAt] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/sign/${params.id}`);
        if (res.ok) {
          const est = await res.json();
          setEstimate(est);
          // If already accepted/signed, show the confirmation (with PDF download) on load.
          if (est.status === 'accepted' || est.signature || est.signedAt) {
            setSigned(true);
            setSignedAt(est.signature?.signedAt || est.signedAt || '');
          }
        }
        else { const d = await res.json(); setError(d.error || 'Estimate not found'); }
      } catch { setError('Failed to load estimate'); }
      finally { setLoading(false); }
    })();
  }, [params.id]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0f172a';
    }
  }, []);

  useEffect(() => { setupCanvas(); }, [signed, estimate]);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setDrawing(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const onMove = (e: React.PointerEvent) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !drawing) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const onUp = () => setDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const hasDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return true;
    }
    return false;
  };

  const generateSignedPDF = async () => {
    const est = estimate!;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    let y = 56;

    // Header
    doc.setFillColor(41, 73, 245);
    doc.rect(0, 0, W, 100, 'F');
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 100, W, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Coltrane Tech Paint', 56, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Professional Painting Estimates', 56, 68);
    doc.setFontSize(20);
    doc.text('INVOICE', W - 56, 52, { align: 'right' });
    doc.setFontSize(10);
    doc.text(est.estimateNumber || '', W - 56, 70, { align: 'right' });
    y = 150;

    // Meta
    doc.setTextColor(102, 113, 132);
    doc.setFontSize(9);
    doc.text('BILL TO', 56, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(est.customerName, 56, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let by = y + 32;
    if (est.customerEmail) doc.text(est.customerEmail, 56, by), by += 15;
    if (est.customerPhone) doc.text(est.customerPhone, 56, by), by += 15;
    if (est.customerAddress) doc.text(est.customerAddress, 56, by), by += 15;
    doc.setTextColor(102, 113, 132);
    doc.setFontSize(9);
    doc.text('PROJECT DETAILS', W - 56, y, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const projectLines = doc.splitTextToSize(est.propertyDescription || '', 220);
    let px = y;
    projectLines.forEach((l: string) => { doc.text(l, W - 56, px + 16, { align: 'right' }); px += 14; });
    if (est.squareFootage) { doc.text(`Area: ${est.squareFootage} sq ft`, W - 56, px + 4, { align: 'right' }); }

    y = 250;
    // Line items
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DESCRIPTION', 56, y);
    doc.text('QTY', 360, y);
    doc.text('UNIT PRICE', 430, y);
    doc.text('TOTAL', W - 56, y, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.line(56, y + 8, W - 56, y + 8);
    y += 26;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    (est.items || []).forEach((it) => {
      const desc = doc.splitTextToSize(it.description, 250);
      desc.forEach((l: string, i: number) => doc.text(l, 56, y + i * 13));
      doc.text(String(it.quantity || 1), 360, y);
      doc.text(`$${(it.unitPrice ?? 0).toFixed(2)}`, 430, y);
      doc.text(`$${(it.total ?? 0).toFixed(2)}`, W - 56, y, { align: 'right' });
      y += Math.max(desc.length * 13, 20);
    });
    y += 12;
    doc.line(56, y, W - 56, y);
    y += 10;

    const subtotal = (est.items || []).reduce((s, i) => s + (i.total ?? 0), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal', 430, y); doc.text(`$${subtotal.toFixed(2)}`, W - 56, y, { align: 'right' }); y += 18;
    doc.text('Tax (8%)', 430, y); doc.text(`$${tax.toFixed(2)}`, W - 56, y, { align: 'right' }); y += 22;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Total Due', 400, y); doc.text(`$${total.toFixed(2)}`, W - 56, y, { align: 'right' });
    y += 50;

    // Signature
    doc.setDrawColor(226, 232, 240);
    doc.line(56, y, 300, y);
    doc.setFontSize(9);
    doc.setTextColor(102, 113, 132);
    doc.text('SIGNED BY', 56, y + 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(est.signature?.signerName || signerName.current?.value || '', 56, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(102, 113, 132);
    const st = est.signature?.signedAt ? new Date(est.signature.signedAt) : null;
    doc.text(st ? `Signed: ${st.toLocaleDateString()} ${st.toLocaleTimeString()}` : 'Signed electronically', 56, y + 42);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Coltrane Tech Paint • This document was signed electronically and is legally binding.', 56, 800);

    return doc;
  };

  const handleSign = async () => {
    setSignError('');
    const name = signerName.current?.value.trim();
    if (!name || name.length < 2) { setSignError('Please enter your full name.'); return; }
    if (!hasDrawing()) { setSignError('Please draw your signature in the box, or type it below.'); return; }

    const canvas = canvasRef.current!;
    const signatureImage = canvas.toDataURL('image/png');
    setSigning(true);
    try {
      const res = await fetch(`/api/sign/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName: name, signatureImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign');
      setSignedAt(data.signedAt);
      setEstimate(prev => prev ? { ...prev, status: 'accepted', signature: { signerName: name, signedAt: data.signedAt } } : prev);
      setSigned(true);
    } catch (e) {
      setSignError(e instanceof Error ? e.message : 'Failed to sign estimate');
    } finally { setSigning(false); }
  };

  const downloadPDF = async () => {
    const doc = await generateSignedPDF();
    doc.save(`estimate-${estimate?.estimateNumber || 'signed'}.pdf`);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <main className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-brand-100 border-t-brand-600 rounded-full animate-spin" />
      </main>
    );
  }

  if (error || !estimate) {
    return (
      <main className="min-h-screen bg-ink-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-10 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="font-display text-2xl font-bold text-ink-900 mb-2">Estimate Not Found</h1>
          <p className="text-ink-600 mb-6">{error || "This estimate doesn't exist or the link is invalid."}</p>
          <Link href="/landing" className="btn btn-primary btn-md">Back to Home</Link>
        </div>
      </main>
    );
  }

  const subtotal = estimate.items.reduce((s: number, i) => s + (i.total ?? 0), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <main className="min-h-screen bg-ink-50 pb-20">
      {/* Top bar */}
      <div className="bg-white border-b border-ink-100 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lift"
              style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
              <span className="text-white font-bold text-xs">CT</span>
            </div>
            <span className="font-display font-bold text-ink-900">Coltrane Tech Paint</span>
          </Link>
          {signed
            ? <span className="badge-green">Signed ✓</span>
            : <span className="badge-blue">{estimate.estimateNumber}</span>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        {signed ? (
          <div className="card p-10 text-center animate-fade-up">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-emerald-200">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-ink-950 mb-2">Estimate Accepted & Signed</h1>
            <p className="text-ink-600 mb-2">Thank you, <strong>{estimate.signature?.signerName}</strong>!</p>
            <p className="text-ink-500 text-sm mb-8">
              Signed electronically {signedAt ? new Date(signedAt).toLocaleString() : ''}. A copy of the signed document is ready below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={downloadPDF} className="btn btn-primary btn-lg">📄 Download Signed PDF</button>
              <Link href="/landing" className="btn btn-ghost btn-lg">Back to Home</Link>
            </div>
          </div>
        ) : (
          <div className="animate-fade-up">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="section-eyebrow">Ready to approve</span>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">Estimate {estimate.estimateNumber}</h1>
              <p className="mt-1.5 text-ink-600">Review the details below, then sign to accept. Created {fmtDate(estimate.createdAt)} • Valid until {fmtDate(estimate.validUntil)}</p>
            </div>

            {/* Customer & project */}
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div className="card p-6">
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">Bill To</p>
                <p className="font-semibold text-ink-900 text-lg">{estimate.customerName}</p>
                <p className="text-ink-600 text-sm">{estimate.customerEmail}</p>
                <p className="text-ink-600 text-sm">{estimate.customerPhone}</p>
                <p className="text-ink-600 text-sm">{estimate.customerAddress}</p>
              </div>
              <div className="card p-6">
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">Project</p>
                <p className="text-ink-700 whitespace-pre-wrap">{estimate.propertyDescription}</p>
                {estimate.roomType && <p className="text-ink-500 text-sm mt-2">Type: {estimate.roomType}</p>}
                {estimate.squareFootage && <p className="text-ink-500 text-sm">Area: {estimate.squareFootage} sq ft</p>}
              </div>
            </div>

            {/* Line items */}
            <div className="card overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="table-shell">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="!text-right">Qty</th>
                      <th className="!text-right">Unit Price</th>
                      <th className="!text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estimate.items.map((it, i) => (
                      <tr key={i}>
                        <td className="font-medium text-ink-900">{it.description}</td>
                        <td className="!text-right">{it.quantity}</td>
                        <td className="!text-right">{fmt(it.unitPrice)}</td>
                        <td className="!text-right font-semibold">{fmt(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-5 border-t border-ink-100 bg-ink-50/40">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-ink-600"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-ink-600"><span>Tax (8%)</span><span>{fmt(tax)}</span></div>
                  <div className="flex justify-between border-t border-ink-200 pt-2.5">
                    <span className="font-display font-bold text-ink-900">Total</span>
                    <span className="font-display font-bold text-xl text-gradient">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="card p-7 mb-6">
              <h2 className="font-display text-xl font-bold text-ink-900 mb-1">✍️ Sign to Accept</h2>
              <p className="text-ink-500 text-sm mb-6">By signing, you agree to the estimate above. Draw your signature in the box, or type your full name below.</p>

              <div className="mb-6">
                <label className="label">Draw your signature</label>
                <div className="border-2 border-ink-200 rounded-2xl overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-36 touch-none"
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerLeave={onUp}
                    onPointerEnter={setupCanvas}
                  />
                </div>
                <button type="button" onClick={clearSignature} className="btn btn-ghost btn-sm mt-2">Clear signature</button>
              </div>

              <div>
                <label className="label">Full Name *</label>
                <input ref={signerName} type="text" className="input" placeholder="Type your full legal name" />
                <p className="text-xs text-ink-400 mt-2">Using {new Date().toLocaleDateString()} as the signing date.</p>
              </div>

              {signError && <div className="badge-red w-full justify-start py-3 px-4 mt-4 text-sm border border-rose-200">{signError}</div>}

              <button onClick={handleSign} disabled={signing}
                className="btn btn-primary btn-lg w-full mt-6 disabled:opacity-50">
                {signing ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing…
                  </span>
                ) : '✅ Sign & Accept Estimate'}
              </button>
            </div>

            <p className="text-center text-xs text-ink-400">
              By signing you agree to be bound by the terms of this estimate. This acts as your electronic signature.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
