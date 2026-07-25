'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Coltrane Tech Paint</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        {/* Geometric accent shapes */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                AI-Powered Estimates
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Professional Painting
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Estimates in Minutes
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Upload photos of any space. Our AI analyzes surfaces, calculates materials, and generates
                detailed line-item estimates — so you can bid faster and win more jobs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 text-center">
                  Get a Free Estimate →
                </Link>
                <a href="#features"
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all text-center">
                  See How It Works
                </a>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-1">✅ Free to start</span>
                <span className="flex items-center gap-1">✅ No credit card</span>
                <span className="flex items-center gap-1">✅ AI-powered</span>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative flex items-center justify-center">
              <img
                src="https://raw.githubusercontent.com/Liberty-Emporium/Logos/main/ChatGPT%20Image%20Jul%2025%2C%202026%2C%2007_17_58%20PM.png"
                alt="Coltrane Tech Paint — AI-powered painting estimates"
                className="w-full max-w-lg rounded-2xl shadow-2xl shadow-blue-500/20 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Three simple steps from photos to a professional estimate</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '📸', title: 'Upload Photos', desc: 'Snap photos of the rooms or exterior surfaces you need painted. Our AI handles the rest.' },
              { step: '2', icon: '🤖', title: 'AI Analyzes', desc: 'The vision model detects surface conditions, measures areas, and calculates materials needed.' },
              { step: '3', icon: '📋', title: 'Get Your Estimate', desc: 'Receive a detailed, line-item estimate with pricing. Email it to your client or download as PDF.' },
            ].map((item) => (
              <div key={item.step} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Built for painting contractors who want to look professional and close faster</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🧠', title: 'AI Vision Analysis', desc: 'Upload room photos — the AI detects wall conditions, trim complexity, and surface prep needs.' },
              { icon: '📊', title: 'Detailed Line Items', desc: 'Every estimate includes itemized materials, labor, and prep work with market-rate pricing.' },
              { icon: '📧', title: 'Email to Clients', desc: 'Send branded estimate emails directly from the app with one click.' },
              { icon: '📝', title: 'E-Signature Ready', desc: 'Send estimates for digital signature via DocuSign integration.' },
              { icon: '📄', title: 'PDF Invoices', desc: 'Customers can view and download professional invoices — print or save as PDF.' },
              { icon: '👥', title: 'Multi-User Access', desc: 'Admin accounts for your team, customer portals for your clients. Role-based access control.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Win More Bids?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join painting contractors who are generating professional estimates in minutes, not hours.
          </p>
          <Link href="/signup"
            className="inline-block px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition shadow-lg text-lg">
            Get Your Free Estimate →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">CT</span>
            </div>
            <span className="text-lg font-bold text-white">Coltrane Tech Paint</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Coltrane Tech Paint. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2">Built for painting contractors, by painting contractors.</p>
        </div>
      </footer>
    </main>
  );
}