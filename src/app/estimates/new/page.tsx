'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PhotoFile {
  file: File;
  preview: string;
}

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
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    propertyDescription: '',
    roomType: '',
    squareFootage: '',
    notes: '',
  });
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      const newPhotos = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPhotos = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
      e.target.value = '';
    }
  }, []);

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
      Object.entries(formData).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });

      photos.forEach(p => {
        fd.append('photos', p.file);
      });

      const response = await fetch('/api/estimates/generate', {
        method: 'POST',
        body: fd,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate estimate');
      }

      window.location.href = `/estimates/${data.estimateId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate estimate');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Estimate</h1>
          <p className="text-gray-600">Fill in the project details and let AI generate a professional estimate</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
          {/* Customer Info */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h18a7 7 0 00-14 0z" />
              </svg>
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(336) 555-0123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@techpaint.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Address *</label>
              <input
                type="text"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St, Liberty, NC"
              />
            </div>
          </section>

          {/* Property Details */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v18a2 2 0 002 2h10a2 2 0 002-2V9.414l3 3m13.293-3.086a1 1 0 010 1.414l-5.586 5.586a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 001.414 0l2-2a1 1 0 000-1.414z" />
              </svg>
              <span>Property Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room / Area Type</label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage (approx)</label>
                <input
                  type="number"
                  name="squareFootage"
                  value={formData.squareFootage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1200"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
              <textarea
                name="propertyDescription"
                value={formData.propertyDescription}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Single-story ranch, built 1998, current color beige…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Special Requests</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Peeling trim on north side, want low-VOC paint…"
              />
            </div>
          </section>

          {/* Photos */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0l6 6a2 2 0 010 2.828L12 22.5l7.586-7.586a2 2 0 000-2.828l-8-8a2 2 0 00-2.828 0l-6 6a2 2 0 000 2.828z" />
              </svg>
              <span>Photos of the Area</span>
            </h2>
            <p className="text-gray-600 mb-4">Upload photos of the area to help AI identify surfaces, conditions, and details</p>

            <div
              onDrop={handleFileDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div className="text-3xl mb-2">📷</div>
              <p className="text-gray-600 text-sm">Drag & drop photos here, or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p.preview} alt={`upload ${i + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={generating}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating Estimate with AI…' : 'Generate Estimate with AI'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}