'use client'

import Link from 'next/link'
import { useAuth } from '@/app/context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const { currentWorker, logout } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-blue to-blue-bright rounded-lg" />
            <span className="font-bold text-lg text-text hidden sm:inline">LBH</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-text-2 hover:text-text transition-colors">
              Browse
            </Link>
            <Link href="/equipment" className="text-text-2 hover:text-text transition-colors">
              Equipment
            </Link>
            <Link href="/about" className="text-text-2 hover:text-text transition-colors">
              About
            </Link>

            {currentWorker ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-text-2 hover:text-text transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg border border-border text-text-2 text-sm font-medium hover:border-text hover:text-text transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/get-listed"
                  className="px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Get Listed
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-2 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border pb-4 animate-slide-down">
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/"
                className="px-4 py-2 text-text-2 hover:text-text transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link
                href="/equipment"
                className="px-4 py-2 text-text-2 hover:text-text transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Equipment
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-text-2 hover:text-text transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              {currentWorker ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-text-2 hover:text-text transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mx-4 px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:opacity-90 transition-opacity w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg border border-border text-text-2 text-sm font-medium hover:border-text hover:text-text transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/get-listed"
                    className="px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:opacity-90 transition-opacity text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Listed
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
