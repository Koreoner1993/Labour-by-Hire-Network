import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Labour by Hire — Australia\'s Construction Workforce Network',
  description:
    'Find verified tradies across Australia. Licence-checked, White Card verified, and Trust Score rated. Free to browse.',
  openGraph: {
    type: 'website',
    siteName: 'Labour by Hire',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-[rgba(255,255,255,0.06)] py-10 mt-16">
              <div className="max-w-6xl mx-auto px-5 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-text-3 tracking-tight">
                  © {new Date().getFullYear()} Labour by Hire · Australia
                </span>
                <nav className="flex gap-6">
                  {[
                    { href: '/', label: 'Browse' },
                    { href: '/employers', label: 'Employers' },
                    { href: '/equipment', label: 'Equipment' },
                    { href: '/about', label: 'About' },
                  ].map(({ href, label }) => (
                    <a key={href} href={href} className="text-xs text-text-3 hover:text-text-2 transition-colors">
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </footer>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
