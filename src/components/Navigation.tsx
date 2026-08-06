'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { hasPermission, Permission } from '@/lib/permissions';

const navItems: { name: string; href: string; perm: Permission; icon: string }[] = [
  { name: 'Dashboard', href: '/dashboard', perm: 'estimates', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { name: 'Estimates', href: '/estimates', perm: 'estimates', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { name: 'Customers', href: '/customers', perm: 'customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: 'Documents', href: '/documents', perm: 'documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { name: 'Users', href: '/users', perm: 'users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Settings', href: '/settings', perm: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as 'owner' | 'secretary' | 'employee' | 'customer' | undefined;
  const isStaff = role && role !== 'customer';
  const isAdmin = role === 'owner';

  const links = isStaff
    ? navItems.filter((i) => hasPermission(role, i.perm)).map((i) => ({ name: i.name, href: i.href, icon: i.icon }))
    : [{ name: 'My Estimates', href: '/portal', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }];

  const homeHref = isStaff ? '/dashboard' : '/portal';
  const roleLabel = role === 'owner' ? 'Owner' : role === 'secretary' ? 'Secretary' : role === 'employee' ? 'Employee' : 'Customer';

  // Don't show app nav on landing/login/root/signup
  if (pathname === '/landing' || pathname === '/login' || pathname === '/' || pathname === '/signup') {
    return null;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-ink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lift group-hover:scale-105 transition-transform"
              style={{ backgroundImage: 'linear-gradient(135deg, #3d6cff, #7c3aed)' }}>
              <span className="text-white font-bold text-sm font-display">CT</span>
            </div>
            <span className="font-display text-lg font-bold text-ink-900 hidden sm:inline">
              Coltrane Tech Paint
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-ink-600 hover:text-brand-600 hover:bg-ink-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  {(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-ink-600 font-medium">
                  {session.user.name || session.user.email}
                </span>
                {isStaff
                  ? <span className="badge-purple">{roleLabel}</span>
                  : <span className="badge-blue">Customer</span>}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-3.5 py-2 text-sm font-medium text-ink-600 hover:text-rose-600 border border-ink-200 rounded-xl hover:border-rose-200 hover:bg-rose-50/50 transition-all"
            >
              Sign Out
            </button>
            {isAdmin && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="hidden"
              ></button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl text-ink-700 hover:bg-ink-50 border border-ink-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-ink-100 space-y-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive(item.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.name}
              </Link>
            ))}
            <hr className="my-2 border-ink-100" />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
