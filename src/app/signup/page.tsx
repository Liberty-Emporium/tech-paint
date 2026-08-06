'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', address: '', city: '', state: '', zip: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters'); return; }

    setLoading(true);
    try {
      const fullAddress = [form.address, form.city, form.state, form.zip].filter(Boolean).join(', ');
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, address: fullAddress }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }

      const loginResult = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (loginResult?.error) router.push('/login');
      else router.push('/request');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-ink-50">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50" />
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
          style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }} />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #ea580c)' }} />
      </div>

      <div className="w-full max-w-lg animate-fade-up">
        <div className="card p-8 sm:p-10 shadow-[0_24px_64px_-24px_rgba(14,17,32,0.25)]">
          <div className="text-center mb-7">
            <Link href="/landing" className="inline-block">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lift"
                style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
                <span className="text-white font-bold text-xl font-display">CT</span>
              </div>
            </Link>
            <h1 className="font-display text-2xl font-extrabold text-ink-950">Create Your Account</h1>
            <p className="text-ink-500 text-sm mt-1.5">Get a free AI painting estimate in minutes</p>
          </div>

          {error && <div className="badge-red w-full justify-start py-2.5 px-3 mb-4 text-sm border border-rose-200">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} className="input" placeholder="John Smith" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className="input" placeholder="john@example.com" />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input type="tel" name="phone" required value={form.phone} onChange={handleChange} className="input" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="label">Street Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="input" placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="input" placeholder="City" />
              </div>
              <div>
                <label className="label">State</label>
                <input type="text" name="state" value={form.state} onChange={handleChange} className="input" placeholder="NC" maxLength={2} />
              </div>
              <div>
                <label className="label">ZIP</label>
                <input type="text" name="zip" value={form.zip} onChange={handleChange} className="input" placeholder="27401" maxLength={10} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password *</label>
                <input type="password" name="password" required value={form.password} onChange={handleChange} className="input" placeholder="••••" minLength={4} />
              </div>
              <div>
                <label className="label">Confirm *</label>
                <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} className="input" placeholder="••••" minLength={4} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-md w-full !py-3 disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </span>
              ) : 'Create Account & Get Estimate'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            Already have an account? <Link href="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
