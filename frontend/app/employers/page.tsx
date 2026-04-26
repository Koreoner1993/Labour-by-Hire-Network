import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Employer Access — Labour by Hire',
  description: 'Find and contact verified tradies instantly. Free to browse — pay only when you need a verified shortlist.',
};

const FEATURES = [
  { title: 'Verified workforce', body: 'Every tradie is licence-checked, White Card verified, and rated with a Trust Score before they appear in results.' },
  { title: 'Free to browse', body: 'Search and filter the full workforce by trade, location, and Trust Score — no account required.' },
  { title: 'Direct contact', body: 'Message any tradie directly from their profile. No middleman, no commission — just a direct introduction.' },
  { title: 'Fast turnaround', body: 'Verification takes under 24 hours so the workforce is always fresh and actively seeking work.' },
];

const STEPS = [
  { n: '01', label: 'Browse', desc: 'Filter by trade, city, and Trust Score to find the right person.' },
  { n: '02', label: 'Contact', desc: 'Send a free message directly to any tradie on their profile.' },
  { n: '03', label: 'Hire', desc: 'Discuss the job details and get started — all outside the platform.' },
];

export default function EmployersPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      {/* Hero */}
      <div className="mb-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-surface-2 border border-[rgba(255,255,255,0.08)] text-text-3 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-6">
          For employers & contractors
        </div>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-5">
          Find verified tradies<br />
          <span className="text-blue-bright">in minutes, not days</span>
        </h1>
        <p className="text-base text-text-2 font-light leading-relaxed mb-8">
          Australia&apos;s construction workforce, verified and ready to work. Browse free with no account — contact anyone instantly.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/" className="inline-flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            Browse tradies
          </Link>
          <Link href="/get-listed" className="inline-flex items-center gap-2 bg-surface-2 border border-[rgba(255,255,255,0.12)] text-text-2 px-5 py-2.5 rounded-full text-sm font-medium hover:text-text transition-colors">
            List your business
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {FEATURES.map(({ title, body }) => (
          <div key={title} className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
            <h3 className="text-base font-medium text-text mb-2">{title}</h3>
            <p className="text-sm text-text-2 font-light leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-2xl font-light tracking-tight mb-8">How it works</h2>
        <div className="flex flex-col gap-4">
          {STEPS.map(({ n, label, desc }) => (
            <div key={n} className="flex items-start gap-5">
              <div className="text-3xl font-light text-text-3 tabular-nums w-10 shrink-0">{n}</div>
              <div>
                <h3 className="text-base font-medium text-text mb-1">{label}</h3>
                <p className="text-sm text-text-2 font-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-surface-2 border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-light tracking-tight mb-3">Ready to find your next hire?</h2>
        <p className="text-sm text-text-3 font-light mb-6">Browse the full verified workforce — completely free.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-blue text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
          Browse tradies now
        </Link>
      </div>
    </div>
  );
}
