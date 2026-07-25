'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TechPaint</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Pricing</a>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">Sign In</a>
              <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Get Started</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New: AI-Powered Estimates
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Fast, Accurate Painting Estimates
                <span className="text-blue-600"> Powered by AI</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Get professional painting estimates in minutes, not hours. Upload photos, describe your project, and let our AI generate detailed, professional estimates instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Get Your Free Estimate
                </Link>
                <a href="#features" className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200">
                  See How It Works
                </a>
              </div>
              <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600 text-sm">Estimates Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-gray-600 text-sm">Customer Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24hr</div>
                  <div className="text-gray-600 text-sm">Average Turnaround</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
              <div className="relative p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm text-green-400 overflow-x-auto">
                  <pre>{`> techpaint estimate --project "Exterior House Paint"
> Analyzing photos... ✓
> Detecting surfaces... ✓ (12 walls, 24 windows, 8 doors)
> Calculating materials... ✓
> Generating estimate... ✓

┌─────────────────────────────────────┐
│  EXTERIOR PAINT ESTIMATE            │
├─────────────────────────────────────┤
│ Surface Area:     3,240 sq ft       │
│ Paint Required:   18 gallons        │
│ Primer Required:  6 gallons         │
│ Labor Hours:      42 hours          │
│ Materials Cost:   $1,847            │
│ Labor Cost:       $2,940            │
├─────────────────────────────────────┤
│ TOTAL ESTIMATE:    $4,787           │
└─────────────────────────────────────┘`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-12 items-center text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="font-medium text-gray-600">Secure & Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span className="font-medium text-gray-600">Verified Contractors</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span className="font-medium text-gray-600">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.1 0-2 .89-2 2v2H4c-1.1 0-2 .89-2 2v12c0 1.1.89 2 2 2h16c1.1 0 2-.89 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>
              <span className="font-medium text-gray-600">Data Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Win More Jobs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Powerful tools designed specifically for painting contractors to win more bids and save time.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📸', title: 'Photo Analysis', desc: 'Upload project photos and let AI identify surfaces, measure areas, and detect conditions automatically.' },
              { icon: '🤖', title: 'AI-Powered Estimates', desc: 'Get detailed material calculations, labor estimates, and pricing in minutes, not hours.' },
              { icon: '📄', title: 'Professional Proposals', desc: 'Generate beautiful, branded proposals that win bids and impress clients.' },
              { icon: '📧', title: 'Email & DocuSign', desc: 'Send estimates directly to clients with integrated e-signature for instant approval.' },
              { icon: '📊', title: 'Dashboard & Analytics', desc: 'Track win rates, revenue, and pipeline health with real-time business intelligence.' },
              { icon: '👥', title: 'Team Collaboration', desc: 'Assign tasks, share files, and communicate with your crew in one place.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">From Photos to Proposal in 3 Steps</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">No complex software. No hours of calculating. Just upload, review, and send.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold">{step}</div>
                </div>
                <div className="pt-10 bg-gray-50 rounded-2xl p-8 h-full">
                  {step === 1 && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">1. Upload & Describe</h3>
                      <p className="text-gray-600">Upload project photos from your phone. Add details like room type, square footage, and special requests.</p>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">2. AI Analyzes & Estimates</h3>
                      <p className="text-gray-600">Our AI identifies surfaces, calculates square footage, determines materials needed, and calculates labor costs.</p>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">3. Review & Send</h3>
                      <p className="text-gray-600">Review the professional estimate, customize if needed, and send to your client with DocuSign integration.</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted by Painting Contractors Nationwide</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">See what contractors are saying about TechPaint.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Mike Rodriguez', company: 'Rodriguez Painting Co.', role: 'Owner', text: '"TechPaint cut my estimate time from 3 hours to 20 minutes. I\'ve won 40% more bids since switching. The AI catches details I used to miss."', rating: 5, avatar: 'MR' },
              { name: 'Sarah Chen', company: 'Chen Painting Solutions', role: 'Project Manager', text: '"The DocuSign integration is a game changer. Clients sign estimates on their phone while I\'m still on site. We\'ve cut our closing time in half."', rating: 5, avatar: 'SC' },
              { name: 'James Thompson', company: 'Thompson Painting', role: 'Owner', text: '"Finally, software built for painters, not generic contractors. The AI catches trim, windows, and ceiling details I used to miss. My margins are up 22%."', rating: 5, avatar: 'JT' },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l4.88-4.01L1.71 9.72l6.87-.5zm0 0"/></svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-lg">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 sm:p-16 lg:p-20 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Win More Bids?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Join 500+ painting contractors who have transformed their estimating process. Start your free trial today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
              <a href="#features" className="w-full sm:w-auto bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-200">
                See Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TP</span>
                </div>
                <span className="text-xl font-bold">TechPaint</span>
              </div>
              <p className="text-gray-400 mb-6">Professional painting estimates powered by AI. Built for contractors, by contractors.</p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.718-1.574 2.093-2.724-.921.564-2.04.973-3.138 1.194-.725-.619-1.973-.776-2.533-.776-2.844 0-4.777 2.236-4.777 4.884 0 .38.045.75.12 1.108C5.65 5.344 1.766 3.514.156 3.514c0 1.73 1.046 3.338 2.585 3.998-.366-.057-.7-.185-1.02-.4v.04c0 2.55 1.778 3.58 4.397 4.056-.435.108-.888.165-1.36.165-.353 0-.695-.032-1.03-.09.72 1.572 2.57 2.578 4.483 2.813-.653.21-1.33.32-2.064.32-.503 0-1-.048-1.483-.14 1.15 1.73 2.95 2.58 4.792 2.58 5.718 0 5.23-4.233 8.523-9.47 8.523-.72 0-1.39-.04-2.06-.13 3.39 2.27 7.48 3.61 11.98 3.61 14.34 0 21.86-14.24 21.86-26.58 0-.4-.01-.8-.03-1.18.74-.5 1.28-1.12 1.62-1.94zm-6.82 5.29c-.04-.28-.42-.5-.8-.5h-1.4v2.6h.72c.21 0 .38-.12.44-.3l1.18-3.17h1.76l1.1 3.17c.05.18.22.3.42.3h.7v-2.6h-1.32l-1.35 3.49h-1.55l-.1-.7c-.13-.7-.47-1.23-.96-1.23-.48 0-.87.4-1.06.78-.06.13-.06.26-.06.39V20H8v-5h4.28l-.98-3H4.84v5h4.16z"/></svg>
                <span className="text-gray-400 hover:text-white transition-colors">Twitter</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.609c0-2.095-1.182-3.972-4.292-3.972-1.973 0-4.289 1.795-4.289 3.945V24H7.88V7.88h2.55V12h-.05c-.074c0-2.17 1.39-4 3.32-4 2.39 0 4 1.75 4 4.26V24H4h4.28l-.6-4.13c.7-.91 2.29-3.23 4.83-3.23 1.93 0 3.98.73 3.98 2.65V24h4.32l-.6-4.44c0-.73.03-1.5.6-2.04z"/></svg>
                <span className="text-gray-400 hover:text-white transition-colors">LinkedIn</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.521 17.34c-.12.41-.77 1.27-1.59 1.44-.81.16-1.52.16-2.14-.03l.04-.15c0-.88.55-1.78 1.45-2.18.7-.3 1.7-.5 2.6-.6.17 3.15-1.84 4.33-3.5 4.32-2.5 0-3.67-2.23-3.67-5.03C7.59 8.35 9.68 6.65 12 6.65c2.08 0 3.98 1.35 4.98 3.25l-.57 2.03c-.94-.4-1.78-.6-2.55-.6-1.47 0-2.39 1.21-2.39 2.64 0 .97.3 1.58.83 1.96.18.11.32.28.37.48.05.17-.25.41-.71.35-.35-.05-.55-.2-.7-.42-.15-.24-.15-.65-.15-1.12 0-2.68 2.07-4.5 4.75-4.5 1.23 0 2.06.52 2.56 1.22.06.09 1.18-.01 1.18-1.03 0-.51-.12-.9-.4-1.24-.09-.1-.22-.18-.37-.23zm1.58 9.23c-.63 0-2.12-.7-2.65-1.16-.42-.33-.75-.79-.75-1.38 0-.72.57-1.55 1.73-1.55.4 0 .82.07 1.1.1.27.02.52.08.75.15.53.16.93.53 1.1.97l.04.1c.35.37.6.73.75 1.2.23.58.23 1.25.23 2.02 0 .88-.6 1.55-1.5 1.78-.61.1-1.3.2-1.77.2-.48 0-.97-.1-1.4-.31zm1.1-7.74c0 .6-.4 1.1-1.07 1.1-.54 0-1.15-.38-1.15-1.05 0-.6.38-1.12 1.1-1.05.4 0 1 .24 1.1.51zm-6.87 1.84c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm0-6c-.3 0-.5.2-.5.5s.2.5.5.5.5-.2.5-.5-.2-.5-.5-.5zm10.03.5c-.9 0-1.8.6-2.06 1.56-.14.36-.28.74-.28 1.15 0 .43.1.85.28 1.23.5.65 1.44 1.1 2.35 1.1.9 0 1.7-.38 2.13-1.1.3-.53.3-1.2.3-1.8v-.1c0-.7-.2-1.15-.4-1.4-.14-.18-.34-.27-.6-.27-.37 0-.64.18-.8.35-.13.1-.3.25-.42.43-.2.27-.26.62-.26 1.03v.1c0 .77.2 1.2.4 1.52.12.22.28.4.48.5.4.18.9.35 1.3.35.5 0 1.1-.1 1.3-.2v.1c0 .6-.22 1.1-.5 1.36-.34.4-1.04.6-1.8.6-.8 0-1.5-.35-1.8-1.1zm5.86-5.54c0 .88-.6 1.5-1.32 1.5-.8 0-1.3-.5-1.3-1.38 0-.9.6-1.38 1.42-1.38.86 0 1.4.5 1.4 1.38zm-2.8 2.7c-.8 0-1.5-.7-1.5-1.54 0-.7.4-1.5 1.43-1.5.8 0 1.6.7 1.6 1.5.02.7-.6 1.5-1.6 1.5-.8 0-1.5-.6-1.5-1.5"/></svg>
                <span className="text-gray-400 hover:text-white transition-colors">GitHub</span>
              </a>
            </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 hover:text-white transition-colors">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 hover:text-white transition-colors">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 hover:text-white transition-colors">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TechPaint. All rights reserved. Built for painting contractors, by painting contractors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}