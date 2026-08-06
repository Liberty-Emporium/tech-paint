'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EstimateResult {
  estimateId: string;
  estimate: {
    id: string;
    estimateNumber: string;
    total: number;
    items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
    generatedBy: string;
  };
}

export default function RequestEstimatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({ roomType: '', squareFootage: '', description: '', notes: '' });
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signup');
  }, [status]);

  const photoTips = [
    ['Wide shots', 'Stand in the center of the room and photograph each wall.'],
    ['Close-ups of problem areas', 'Cracks, holes, peeling paint, water damage, stains.'],
    ['Trim & details', 'Baseboards, crown molding, window frames, door frames.'],
    ['Ceiling', 'Look up and photograph any damage or discoloration.'],
    ['Exterior shots', 'For exterior jobs, photograph all sides of the house.'],
  ];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const combined = [...photos, ...newFiles].slice(0, 10);
    setPhotos(combined);
    setPreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    setPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    // Photos optional for the demo — a description alone generates an estimate.
    if (!form.description.trim()) { setError('Please describe the work that needs to be done.'); return; }
    setError(''); setStep('loading');
    try {
      const fd = new FormData();
      fd.append('customerName', session?.user?.name || '');
      fd.append('customerEmail', session?.user?.email || '');
      fd.append('customerPhone', (session?.user as any)?.phone || '');
      fd.append('customerAddress', (session?.user as any)?.address || '');
      fd.append('propertyDescription', form.description);
      fd.append('roomType', form.roomType);
      fd.append('squareFootage', form.squareFootage);
      fd.append('notes', form.notes);
      photos.forEach(p => fd.append('photos', p));

      // Give the server time to finish, but fail clearly if the network drops.
      const res = await fetch('/api/estimates/generate', {
        method: 'POST',
        body: fd,
      }).catch((networkErr) => {
        throw new Error(
          'Could not reach the server. Please check your internet connection and try again. (' +
          (networkErr instanceof Error && networkErr.name === 'AbortError' ? 'request timed out' : 'network error') + ')'
        );
      });

      let data: any = {};
      try { data = await res.json(); }
      catch { /* non-JSON response — fall through */ }

      if (res.ok && data?.estimate) { setEstimate(data); setStep('result'); }
      else {
        const serverMsg = data?.error || data?.message || '';
        setError(
          serverMsg && serverMsg !== 'Something went wrong. Please try again.'
            ? serverMsg
            : 'The estimate could not be generated. Try again in a few seconds, or check that your AI settings are configured.'
        );
        setStep('form');
      }
    } catch (e) {
      // Friendly, specific message instead of a generic "something went wrong".
      setError(e instanceof Error ? e.message : 'An unexpected error occurred. Please try again.');
      setStep('form');
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <main className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="bg-white border-b border-ink-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lift"
              style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
              <span className="text-white font-bold text-xs">CT</span>
            </div>
            <span className="font-display font-bold text-ink-900">Coltrane Tech Paint</span>
          </Link>
          {session?.user && <span className="text-sm text-ink-500">Hi, {session.user.name}</span>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
        {step === 'form' && (
          <>
            <div className="text-center mb-8 animate-fade-up">
              <span className="section-eyebrow">Free Estimate</span>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-ink-950 mb-2">Get Your Free Painting Estimate</h1>
              <p className="text-ink-600">Upload photos and describe the job — our AI gives you a rough estimate in seconds.</p>
            </div>

            {error && <div className="badge-red w-full justify-start py-3 px-4 mb-6 text-sm border border-rose-200">{error}</div>}

            {/* Photo upload */}
            <section className="card p-6 sm:p-7 mb-6">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3">📸 Upload Photos</h2>
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-900">
                <p className="font-semibold mb-2">📸 Photo Tips — take ALL of these for the most accurate estimate:</p>
                <ul className="space-y-1.5">
                  {photoTips.map(([title, desc]) => (
                    <li key={title}>• <strong>{title}</strong> — {desc}</li>
                  ))}
                </ul>
                <p className="mt-2 font-medium">The more photos you provide, the more accurate your estimate!</p>
              </div>

              <div
                className="border-2 border-dashed border-ink-200 rounded-2xl p-9 text-center hover:border-brand-300 hover:bg-brand-50/30 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              >
                <div className="text-4xl mb-3">📷</div>
                <p className="text-ink-700 font-medium">Click to upload or drag photos here</p>
                <p className="text-ink-400 text-sm mt-1">Choose from your photo gallery</p>
                <p className="text-ink-400 text-xs mt-2">Up to 10 photos • JPG, PNG, WebP</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-5">
                  {previews.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded-xl border border-ink-100" />
                      <button onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-700">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Description */}
            <section className="card p-6 sm:p-7 mb-6">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-2">📝 Describe the Job</h2>
              <p className="text-ink-500 text-sm mb-5">Tell us about the area and what needs to be done. The more detail, the better the estimate.</p>

              <div className="space-y-4">
                <div>
                  <label className="label">Room / Area Type</label>
                  <select value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})} className="input">
                    <option value="">Select area type…</option>
                    <option value="interior">Interior Room</option>
                    <option value="exterior">Exterior</option>
                    <option value="cabinet">Cabinets</option>
                    <option value="ceiling">Ceiling Only</option>
                    <option value="trim">Trim & Molding Only</option>
                    <option value="deck">Deck / Fence</option>
                    <option value="commercial">Commercial Space</option>
                  </select>
                </div>

                <div>
                  <label className="label">Square Footage <span className="text-ink-400 font-normal">(Length × Width)</span></label>
                  <input type="number" value={form.squareFootage} onChange={e => setForm({...form, squareFootage: e.target.value})} className="input" placeholder="e.g. 12 × 15 = 180" />
                  <p className="text-xs text-ink-400 mt-1">For walls: measure height × width of each wall and add them up.</p>
                </div>

                <div>
                  <label className="label">Describe the Work Needed *</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={5} className="input"
                    placeholder={'Examples:\n• Walls need to be stripped to drywall and re-primed\n• Several holes that need filled with joint compound\n• Peeling paint scraped and the surface prepped\n• The whole room needs 2 coats including ceiling\n• Trim, baseboards, and window frames need painting'} />
                  <p className="text-xs text-ink-400 mt-1">Include: stripping? prep work? holes to fill? how many coats? trim?</p>
                </div>

                <div>
                  <label className="label">Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} className="input"
                    placeholder="Color preferences, timeline, special requests, access instructions, pet warnings, etc." />
                </div>
              </div>
            </section>

            <button onClick={handleSubmit} className="btn btn-primary btn-lg w-full">
              🤖 Get AI Estimate
            </button>
          </>
        )}

        {step === 'loading' && (
          <div className="text-center py-24 animate-fade-up">
            <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-7" />
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">Analyzing Your Photos…</h2>
            <p className="text-ink-600">Our AI is examining the surfaces, measuring areas, and calculating materials.</p>
            <p className="text-ink-400 text-sm mt-2">This usually takes 10–30 seconds</p>
          </div>
        )}

        {step === 'result' && estimate && (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100">
                <span className="text-4xl">✅</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-ink-950 mb-2">Your Rough Estimate</h1>
              <p className="text-ink-600">
                {estimate.estimate.generatedBy?.includes('ai')
                  ? `Based on analysis of ${photos.length} photo${photos.length > 1 ? 's' : ''} and your description`
                  : 'Based on your room type and square footage'}
              </p>
            </div>

            <div className="card overflow-hidden mb-6">
              <div className="px-6 py-5 text-white flex justify-between items-center" style={{ backgroundImage: 'linear-gradient(120deg, #3d6cff, #7c3aed)' }}>
                <div>
                  <p className="text-white/80 text-sm">Estimate Number</p>
                  <p className="text-xl font-bold font-display">{estimate.estimate.estimateNumber || estimate.estimateId}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Estimated Total</p>
                  <p className="text-4xl font-bold font-display">{fmt(estimate.estimate.total)}</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-ink-900 mb-3">Line Items</h3>
                <div className="space-y-2">
                  {estimate.estimate.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2.5 border-b border-ink-100 last:border-0">
                      <div>
                        <p className="text-ink-800">{item.description}</p>
                        <p className="text-xs text-ink-400">Qty: {item.quantity} × {fmt(item.unitPrice)}</p>
                      </div>
                      <span className="font-semibold text-ink-900">{fmt(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="border border-brand-100 rounded-2xl p-6 mb-6 bg-brand-50/40">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-3">📞 What Happens Next</h3>
              <div className="space-y-3 text-ink-700">
                {[
                  ['A professional will contact you within 24 hours', "They'll schedule a visit for a detailed assessment."],
                  ['On-site assessment & final quote', 'Verify measurements and surface conditions, then provide the final quote.'],
                  ['Schedule your painting project', 'Once you approve the quote, we\'ll schedule at a time that works for you.'],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xl">{['1️⃣','2️⃣','3️⃣'][i]}</span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-ink-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-ink-100/60 border border-ink-200 rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm text-ink-600">
                <strong>📌 Please note:</strong> This is a rough AI estimate based on your photos. The final quote may vary after an in-person assessment.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/portal" className="flex-1 btn btn-primary btn-md">View My Estimates</Link>
              <button onClick={() => { setStep('form'); setError(''); }}
                className="flex-1 btn btn-ghost btn-md">Start Over</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
