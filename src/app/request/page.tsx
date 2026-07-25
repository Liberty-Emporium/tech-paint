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
  const [form, setForm] = useState({
    roomType: '',
    squareFootage: '',
    description: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signup');
  }, [status]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const combined = [...photos, ...newFiles].slice(0, 10); // max 10 photos
    setPhotos(combined);
    // Generate previews
    const newPreviews = combined.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    const newPhotos = photos.filter((_, i) => i !== idx);
    const newPreviews = newPhotos.map(f => URL.createObjectURL(f));
    setPhotos(newPhotos);
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      setError('Please upload at least one photo of the area to be painted.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please describe the work that needs to be done.');
      return;
    }

    setError('');
    setStep('loading');

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

      const res = await fetch('/api/estimates/generate', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok) {
        setEstimate(data);
        setStep('result');
      } else {
        setError(data.error || 'Failed to generate estimate');
        setStep('form');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setStep('form');
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  if (status === 'loading') {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-blue-600 text-lg">Loading…</div></main>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">CT</span>
            </div>
            <span className="font-bold text-gray-900">Coltrane Tech Paint</span>
          </Link>
          {session?.user && (
            <span className="text-sm text-gray-500">Hi, {session.user.name}</span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 'form' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Your Free Painting Estimate</h1>
              <p className="text-gray-600">Upload photos and describe the job — our AI will give you a rough estimate in seconds.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">{error}</div>
            )}

            {/* Photo Upload Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📸 Upload Photos</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm text-amber-800">
                <p className="font-semibold mb-2">📸 Photo Tips — Take ALL of these for the most accurate estimate:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Wide shots</strong> — Stand in the center of the room and photograph each wall (all 4 walls if interior)</li>
                  <li><strong>Close-ups of problem areas</strong> — Cracks, holes, peeling paint, water damage, stains</li>
                  <li><strong>Trim & details</strong> — Baseboards, crown molding, window frames, door frames</li>
                  <li><strong>Ceiling</strong> — Look up and photograph any damage or discoloration</li>
                  <li><strong>Closet/alcove areas</strong> — If they need painting too</li>
                  <li><strong>Exterior shots</strong> — For exterior jobs, photograph all sides of the house</li>
                </ul>
                <p className="mt-2 font-medium">The more photos you provide, the more accurate your estimate will be!</p>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
              >
                <div className="text-4xl mb-3">📷</div>
                <p className="text-gray-700 font-medium">Click to upload or drag photos here</p>
                <p className="text-gray-400 text-sm mt-1">Or take a photo from your phone camera</p>
                <p className="text-gray-400 text-xs mt-2">Up to 10 photos • JPG, PNG, WebP</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                  {previews.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Job Description */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📝 Describe the Job</h2>
              <p className="text-gray-500 text-sm mb-4">Tell us about the area and what needs to be done. The more detail, the better the estimate.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room / Area Type</label>
                  <select value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Square Footage
                    <span className="text-gray-400 font-normal ml-2">(Length × Width = sq ft)</span>
                  </label>
                  <input type="number" value={form.squareFootage}
                    onChange={e => setForm({...form, squareFootage: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 12 × 15 = 180 sq ft → enter 180" />
                  <p className="text-xs text-gray-400 mt-1">Measure the room: multiply length × width. For walls: measure height × width of each wall and add them up.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Work Needed *</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Examples:&#10;• Walls need to be stripped to drywall and re-primed&#10;• There are several holes that need to be filled with joint compound&#10;• Peeling paint needs to be scraped and the surface prepped&#10;• The whole room needs 2 coats of paint including ceiling&#10;• Trim, baseboards, and window frames need painting&#10;• Water stain on ceiling needs primer before painting" />
                  <p className="text-xs text-gray-400 mt-1">Include: Does it need stripping? Prep work? Holes to fill? How many coats? Does it include trim?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Color preferences, timeline, special requests, access instructions, pet warnings, etc." />
                </div>
              </div>
            </section>

            <button onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/25">
              🤖 Get AI Estimate
            </button>
          </>
        )}

        {step === 'loading' && (
          <div className="text-center py-20">
            <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Photos…</h2>
            <p className="text-gray-600">Our AI is examining the surfaces, measuring areas, and calculating materials.</p>
            <p className="text-gray-400 text-sm mt-2">This usually takes 10-30 seconds</p>
          </div>
        )}

        {step === 'result' && estimate && (
          <div>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Rough Estimate</h1>
              <p className="text-gray-600">
                {estimate.estimate.generatedBy?.includes('ai')
                  ? `Based on analysis of ${photos.length} photo${photos.length > 1 ? 's' : ''} and your description`
                  : 'Based on your room type and square footage'}
              </p>
            </div>

            {/* Estimate Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 text-white flex justify-between items-center">
                <div>
                  <p className="text-blue-200 text-sm">Estimate Number</p>
                  <p className="text-xl font-bold">{estimate.estimate.estimateNumber || estimate.estimateId}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-200 text-sm">Estimated Total</p>
                  <p className="text-4xl font-bold">{fmt(estimate.estimate.total)}</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-3">Line Items</h3>
                <div className="space-y-2">
                  {estimate.estimate.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-gray-800">{item.description}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × {fmt(item.unitPrice)}</p>
                      </div>
                      <span className="font-semibold text-gray-900">{fmt(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">📞 What Happens Next</h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex gap-3">
                  <span className="text-xl">1️⃣</span>
                  <div>
                    <p className="font-semibold">A painting professional will contact you within 24 hours</p>
                    <p className="text-sm text-blue-600">They&apos;ll schedule a time to visit your property for a detailed assessment.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">2️⃣</span>
                  <div>
                    <p className="font-semibold">On-site assessment & final quote</p>
                    <p className="text-sm text-blue-600">The professional will verify measurements, surface conditions, and provide a final detailed quote.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">3️⃣</span>
                  <div>
                    <p className="font-semibold">Schedule your painting project</p>
                    <p className="text-sm text-blue-600">Once you approve the quote, we&apos;ll schedule your project at a time that works for you.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600">
                <strong>📌 Please note:</strong> This is a rough AI estimate based on your photos. 
                The final quote may vary after an in-person assessment of surface conditions, prep work needed, and paint quality selected.
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/portal"
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl text-center hover:bg-blue-700 transition">
                View My Estimates
              </Link>
              <button onClick={() => { setStep('form'); setEstimate(null); setPhotos([]); setPreviews([]); }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl text-center hover:border-blue-300 transition">
                Submit Another Request
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}