'use client';

import Link from 'next/link';

const steps = [
  {
    step: '01',
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
    title: 'Snap Your Space',
    desc: 'Photograph the rooms or exterior surfaces that need painting. Wide shots, close-ups, and trim — our tool takes it from there.',
  },
  {
    step: '02',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    title: 'AI Measures & Prices',
    desc: 'The vision model reads surfaces, catches prep work, and generates accurate line-item pricing with materials and labor.',
  },
  {
    step: '03',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Deliver in Minutes',
    desc: 'Email a branded estimate, send it for e-signature, or drop a PDF invoice — professional and ready to close the job.',
  },
];

const features = [
  { icon: '🧠', title: 'AI Vision Analysis', desc: 'Photos in, line items out. The AI catches wall conditions, trim complexity, and surface prep automatically.' },
  { icon: '📊', title: 'Detailed Line Items', desc: 'Itemized materials, labor, and prep at market-rate pricing — no guesswork, no vague bids.' },
  { icon: '✉️', title: 'Branded Email', desc: 'Send polished, on-brand estimate emails to clients with one click from anywhere in the app.' },
  { icon: '✍️', title: 'E-Signature Ready', desc: 'Push estimates for digital sign-off via DocuSign and close deals without printing a thing.' },
  { icon: '📄', title: 'PDF Invoices', desc: 'Customers view and download crisp professional invoices — print or save as PDF in seconds.' },
  { icon: '👥', title: 'Team & Client Access', desc: 'Admin seats for your crew, customer portals for your clients. Clean role-based access control.' },
];

const stats = [
  { value: '2×', label: 'Faster bids' },
  { value: '100%', label: 'On-brand quotes' },
  { value: '24h', label: 'Turnaround' },
  { value: '∞', label: 'Jobs you can win' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-ink-50 overflow-x-hidden">
      {/* ===== Nav ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lift"
              style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
              <span className="text-white font-bold text-sm font-display">CT</span>
            </div>
            <span className="font-display text-lg font-bold text-ink-900">Coltrane Tech Paint</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-brand-600 rounded-xl hover:bg-ink-50 transition-all">
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary btn-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-violet-50" />
          <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl animate-float"
            style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }} />
          <div className="absolute bottom-0 -left-24 w-[460px] h-[460px] rounded-full opacity-25 blur-3xl animate-float"
            style={{ backgroundImage: 'linear-gradient(135deg, #f97316, #ea580c)' }} />
          <div className="absolute inset-0 opacity-[0.35]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(24,28,46,0.06) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left copy */}
            <div className="animate-fade-up">
              <span className="section-eyebrow">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                AI-Powered Estimates
              </span>
              <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-ink-950 leading-[1.05]">
                Painting bids
                <span className="block text-gradient">
                  in minutes,
                </span>
                <span className="block">not hours.</span>
              </h1>
              <p className="mt-6 text-xl text-ink-600 leading-relaxed max-w-xl">
                Snap a few photos. Our AI measures the space, prices materials and labor, and hands
                you a professional, line-item estimate ready to win the job.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="btn btn-primary btn-lg text-base">
                  Get a Free Estimate
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </Link>
                <a href="#how" className="btn btn-ghost btn-lg text-base">
                  See How It Works
                </a>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-500">
                {['✓ Free to start', '✓ No credit card', '✓ AI-powered', '✓ PDF invoices'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Right visual */}
            <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl"
                  style={{ backgroundImage: 'linear-gradient(120deg, #3d6cff, #7c3aed 55%, #f97316)' }} />
                <img
                  src="https://raw.githubusercontent.com/Liberty-Emporium/Logos/main/ChatGPT%20Image%20Jul%2025%2C%202026%2C%2007_17_58%20PM.png"
                  alt="Coltrane Tech Paint — AI-powered painting estimates"
                  className="relative w-full rounded-[1.75rem] shadow-2xl object-cover border border-white/60"
                />
              </div>

              {/* Floating stat cards */}
              <div className="absolute -left-6 top-10 card px-4 py-3 shadow-lift animate-float">
                <div className="text-xs font-semibold text-ink-500">Estimate Total</div>
                <div className="font-display text-xl font-bold text-ink-900">$4,860</div>
              </div>
              <div className="absolute -right-4 bottom-12 card px-4 py-3 shadow-lift animate-float" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sent for approval
                </div>
                <div className="font-display text-sm font-bold text-ink-700 mt-1">3 bedrooms · 2 baths</div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="card card-hover px-6 py-5 text-center">
                <div className="font-display text-3xl font-extrabold text-gradient">{s.value}</div>
                <div className="mt-1 text-sm font-medium text-ink-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how" className="py-24 bg-white border-y border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-eyebrow">The Process</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold text-ink-950">
              From photos to a professional bid
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              Three simple steps — no spreadsheets, no guesswork.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="card card-hover p-9 relative overflow-hidden group">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lift"
                    style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div className="mt-6 font-display text-5xl font-black text-ink-100">{item.step}</div>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-ink-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="py-24 bg-ink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-eyebrow">Everything You Need</span>
            <h2 className="mt-4 font-display text-4xl font-extrabold text-ink-950">
              Built to look professional & close faster
            </h2>
            <p className="mt-4 text-lg text-ink-600">
              For painting contractors who want to win more bids.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card card-hover p-7 hover:border-brand-200">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10"
          style={{ backgroundImage: 'linear-gradient(120deg, #1e2d8e, #4c1d95 60%, #9a3412)' }} />
        <div className="absolute -top-20 right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Ready to win more bids?
          </h2>
          <p className="mx-auto mt-5 text-xl text-brand-100 max-w-2xl">
            Join contractors generating professional estimates in minutes — and booking the jobs that follow.
          </p>
          <div className="mt-9">
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-brand-700 font-bold rounded-2xl shadow-2xl hover:-translate-y-0.5 hover:bg-brand-50 transition-all text-lg">
              Get Your Free Estimate
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-ink-950 text-ink-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lift"
                style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
                <span className="text-white font-bold text-sm font-display">CT</span>
              </div>
              <span className="font-display text-lg font-bold text-white">Coltrane Tech Paint</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Coltrane Tech Paint. All rights reserved.</p>
            <p className="text-xs text-ink-500 mt-2">Built for painting contractors, by painting contractors.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
