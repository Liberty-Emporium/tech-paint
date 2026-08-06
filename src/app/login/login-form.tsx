'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      // Portal redirects staff to the dashboard based on role.
      window.location.href = callbackUrl || '/portal';
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-ink-50">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50" />
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
          style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }} />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #ea580c)' }} />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        <div className="card p-8 sm:p-10 shadow-[0_24px_64px_-24px_rgba(14,17,32,0.25)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lift"
              style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
              <span className="text-white font-bold text-2xl font-display">CT</span>
            </div>
            <h1 className="font-display text-2xl font-extrabold text-ink-950">Welcome back</h1>
            <p className="text-ink-500 mt-1.5">Sign in to Coltrane Tech Paint</p>
          </div>

          {error && (
            <div className="badge-red w-full justify-start mb-4 py-2.5 px-3 text-sm border border-rose-200" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email" name="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="input" placeholder="you@coltranetechpaint.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label !mb-0">Password</label>
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={show ? 'text' : 'password'} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  aria-label="Toggle password visibility">
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-md w-full !py-3 disabled:opacity-50">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/landing" className="text-sm text-ink-500 hover:text-brand-600 transition-colors">
              ← Back to site
            </Link>
            <p className="mt-3 text-xs text-ink-400">
              Contact your administrator for login credentials
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
