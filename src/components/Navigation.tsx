'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { hasPermission, Permission } from '@/lib/permissions';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const can = (perm: Permission) => hasPermission(role, perm);

  // Owner gets the full admin set; secretary/employee see their scoped subsets.
  const isStaff = role && role !== 'customer';

  const links = isStaff
    ? [
        { name: 'Dashboard', href: '/dashboard', show: true },
        { name: 'Estimates', href: '/estimates', show: can('estimates') },
        { name: 'Customers', href: '/customers', show: can('customers') },
        { name: 'Documents', href: '/documents', show: can('documents') },
        { name: 'Users', href: '/users', show: can('users') },
        { name: 'Settings', href: '/settings', show: can('settings') },
      ].filter(l => l.show)
    : [
        { name: 'My Estimates', href: '/portal', show: true },
      ].filter(l => l.show);

  // Don't show nav on landing or login pages
  if (pathname === '/landing' || pathname === '/login' || pathname === '/') {
    return null;
  }

  const homeHref = isStaff ? '/dashboard' : '/portal';
  const roleLabel = role === 'owner' ? 'Owner' : role === 'secretary' ? 'Secretary' : role === 'employee' ? 'Employee' : 'Customer';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">Coltrane Tech Paint</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side — user + sign out */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user && (
              <span className="text-sm text-gray-500">
                {session.user.name || session.user.email}
                {!isStaff && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Customer</span>}
                {isStaff && <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{roleLabel}</span>}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-2 border-gray-200" />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
