import Link from 'next/link';

/**
 * Global footer shown on every page.
 * Branding: Coltrane Tech Paint, in partnership with Alexander AI Solutions.
 */
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}
          >
            <span className="text-white font-bold text-xs font-display">CT</span>
          </div>
          <span className="text-sm font-medium text-ink-700">Coltrane Tech Paint</span>
        </div>

        <p className="text-sm text-ink-500 text-center">
          In partnership with{' '}
          <Link
            href="https://jays-web.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-800 font-medium hover:text-brand-600 transition-colors"
          >
            Alexander AI Solutions
          </Link>
        </p>

        <p className="text-xs text-ink-400">© {new Date().getFullYear()} Coltrane Tech Paint</p>
      </div>
    </footer>
  );
}
