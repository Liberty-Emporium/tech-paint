'use client';

import { Suspense } from 'react';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-brand-600">
          <span className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading…</span>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
