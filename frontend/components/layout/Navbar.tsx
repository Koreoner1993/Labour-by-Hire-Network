'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/modals/LoginModal';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { worker, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  const navLinks = [
    { href: '/', label: 'Find Workers' },
    { href: '/equipment', label: 'Equipment' },
    { href: '/employers', label: 'Employers' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="2.5" fill="#fff"/>
                <ellipse cx="10" cy="10" rx="8.5" ry="3.5" stroke="#fff" strokeWidth="1.2" fill="none"/>
                <ellipse cx="10" cy="10" rx="8.5" ry="3.5" stroke="#fff" strokeWidth="1.2" fill="none" transform="rotate(60 10 10)"/>
                <ellipse cx="10" cy="10" rx="8.5" ry="3.5" stroke="#fff" strokeWidth="1.2" fill="none" transform="rotate(120 10 10)"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-text tracking-tight">Labour by Hire</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'px-3 py-1.5 rounded-lg text-sm transition-colors',
                  pathname === href
                    ? 'text-text bg-surface-2'
                    : 'text-text-3 hover:text-text-2',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {isLoading ? (
              <div className="w-20 h-7 bg-surface-2 rounded-full animate-pulse" />
            ) : worker ? (
              <>
                <Link href="/dashboard" className="text-sm text-text-3 hover:text-text transition-colors px-3 py-1.5 hidden sm:block">
                  Dashboard
                </Link>
                <span className="text-xs text-text-3 hidden sm:block">
                  {worker.first_name}
                </span>
                <Button variant="secondary" size="sm" onClick={() => { logout(); router.push('/'); }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)}>
                  Sign in
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push('/get-listed')}>
                  Get listed
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}
