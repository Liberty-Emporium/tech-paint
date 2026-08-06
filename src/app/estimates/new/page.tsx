'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  propertyDescription: string;
  roomType: string;
  squareFootage: string;
  notes: string;
}

export default function NewEstimatePage() {
  const [formData, setFormData] = useState<FormData>({
    customerName: '', customerEmail: '', customerPhone: '', customerAddress: '',
    propertyDescription: '', roomType: '', squareFootage: '', notes: '',
  });
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    if (imgs.length > 0) {
      setPhotos(prev => [...prev, ...imgs.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    }
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  }, [addFiles]);

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGenerating(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => { if (value) fd.append(key, value); });
      photos.forEach(p => fd.append('photos', p.file));
      const response = await fetch('/api/estimates/generate', { method: 'POST', body: fd });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate estimate');
      window.location.href = `/estimates/${data.estimateId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate estimate');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 pt-24 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <Link href="/estimates" className="text-sm text-ink-500 hover:text-brand-600 transition-colors">← Back to estimates</Link>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink-950">New Estimate</h1>
          <p className="mt-1.5 text-ink-600">Fill in the project details and let AI generate a professional estimate</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Info */}
          <section className="card p-7 sm:p-8">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-6 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Name *</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="input" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required className="input" placeholder="(336) 555-0123" />
              </div>
            </div>
            <div className="mt-5">
              <label className="label">Email *</label>
              <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} required className="input" placeholder="jane@email.com" />
            </div>
            <div className="mt-5">
              <label className="label">Property Address *</label>
              <input type="text" name="customerAddress" value={formData.customerAddress} onChange={handleChange} required className="input" placeholder="123 Main St, Liberty, NC" />
            </div>
          </section>

          {/* Property Details */}
          <section className="card p-7 sm:p-8">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-6 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </span>
              Property Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Room / Area Type</label>
                <select name="roomType" value={formData.roomType} onChange={handleChange} className="input">
                  <option value="">Select…</option>
                  <option>Interior — single room</option>
                  <option>Interior — multiple rooms</option>
                  <option>Interior — whole house</option>
                  <option>Exterior — siding</option>
                  <option>Exterior — trim only</option>
                  <option>Cabinets</option>
                  <option>Deck / fence</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div>
                <label className="label">Square Footage (approx)</label>
                <input type="number" name="squareFootage" value={formData.squareFootage} onChange={handleChange} min="0" className="input" placeholder="1200" />
              </div>
            </div>
            <div className="mt-5">
              <label className="label">Property Description</label>
              <textarea name="propertyDescription" value={formData.propertyDescription} onChange={handleChange} rows={2} className="input" placeholder="Single-story ranch, built 1998, current color beige…" />
            </div>
            <div className="mt-5">
              <label className="label">Notes / Special Requests</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="input" placeholder="Peeling trim on north side, want low-VOC paint…" />
            </div>
          </section>

          {/* Photos */}
          <section className="card p-7 sm:p-8">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-2 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </span>
              Photos of the Area
            </h2>
            <p className="text-ink-600 text-sm mb-5 ml-[42px]">Upload photos to help AI identify surfaces, conditions, and details.</p>

            <div
              onDrop={handleFileDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-ink-200 rounded-2xl p-10 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/40 transition-all"
            >
              <div className="text-4xl mb-3">📷</div>
              <p className="text-ink-600 text-sm font-medium">Drag & drop photos here, or click to browse</p>
              <p className="text-ink-400 text-xs mt-1">JPG / PNG — you can add up to 10</p>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-5">
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p.preview} alt={`upload ${i + 1}`} className="w-full h-20 object-cover rounded-xl border border-ink-100" />
                    <button
                      type="button" onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-rose-700"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit" disabled={generating}
              className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating Estimate with AI…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Estimate with AI
                </span>
              )}
            </button>
            {error && (
              <div className="mt-4 badge-red w-full justify-start py-3 px-4 text-sm border border-rose-200">{error}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
