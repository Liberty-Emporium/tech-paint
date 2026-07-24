'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef } from 'react';

interface PhotoFile {
  file: File;
  preview: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    propertyDescription: '',
    roomType: '',
    squareFootage: '',
    notes: '',
  });
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading…</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">TechPaint</h1>
          <p className="text-gray-600 mt-2">Please sign in to access your estimates</p>
          <a href="/login" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Sign In
          </a>
        </div>
      </main>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addFiles = (files: File[]) => {
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Estimate submitted', { ...form, photos: photos.length, user: session.user?.email });
    setSubmitted(true);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Estimate Request Received</h1>
          <p className="text-gray-600 mb-6">
            Thanks {form.customerName || 'friend'}! We&apos;ll review your project
            {form.squareFootage ? ` (~${form.squareFootage} sq ft)` : ''} and get back to you
            {form.email ? ` at ${form.email}` : ''} within 1 business day.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                customerName: '', email: '', phone: '', address: '',
                propertyDescription: '', roomType: '', squareFootage: '', notes: '',
              });
              setPhotos([]);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit Another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <header className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TechPaint</h1>
          <p className="text-gray-600 text-sm">Signed in as {session.user?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TechPaint</h1>
          <p className="text-gray-600 mt-2">Get a fast, accurate painting estimate. Tell us about your project and snap a few photos.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                required
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                required
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="(336) 555-0123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              required
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="123 Main St, Liberty, NC"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room / Area Type</label>
              <select
                name="roomType"
                value={form.roomType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
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
                name="squareFootage"
                type="number"
                min="0"
                value={form.squareFootage}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="1200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
            <textarea
              name="propertyDescription"
              value={form.propertyDescription}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Single-story ranch, built 1998, current color beige…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Special Requests</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Peeling trim on north side, want low-VOC paint…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Photos of the Area</label>
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
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
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Get My Free Estimate
          </button>
        </form>
      </div>
    </main>
  );
}