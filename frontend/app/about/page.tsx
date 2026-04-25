import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Labour by Hire',
  description: 'How Labour by Hire works — Australia\'s verified construction workforce network.',
};

const PILLARS = [
  { title: 'Verification first', body: 'Every tradie submits their licence number and White Card before going live. We check them manually within 24 hours — no shortcuts.' },
  { title: 'Trust Score', body: 'A transparent 100-point score based on profile completeness, verified credentials, tenure, and active listing status. Employers know instantly who to trust.' },
  { title: 'Free to browse', body: 'Employers can search, filter, and contact any tradie at no cost, forever. We believe friction gets in the way of great hires.' },
  { title: 'Free to list', body: 'Tradies get a verified profile at no charge. We monetise through premium placements and employer tools — not by gatekeeping the basics.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      {/* Intro */}
      <div className="mb-14">
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-5">
          About Labour by Hire
        </h1>
        <p className="text-base text-text-2 font-light leading-relaxed max-w-xl">
          We built Labour by Hire because hiring tradies in Australia is still frustrating — too many middlemen, too little transparency, too much wasted time. We&apos;re fixing that.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-7 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-3 mb-3">Our mission</h2>
        <p className="text-lg font-light text-text leading-relaxed">
          Connect every verified Australian tradie with the employers who need them — transparently, instantly, and for free.
        </p>
      </div>

      {/* Pillars */}
      <h2 className="text-2xl font-light tracking-tight mb-6">How we do it</h2>
      <div className="flex flex-col gap-4 mb-14">
        {PILLARS.map(({ title, body }) => (
          <div key={title} className="flex gap-5 border-b border-[rgba(255,255,255,0.06)] pb-5 last:border-0">
            <div className="w-1 rounded-full bg-blue shrink-0 self-stretch" />
            <div>
              <h3 className="text-base font-medium text-text mb-1.5">{title}</h3>
              <p className="text-sm text-text-2 font-light leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Business model */}
      <div className="bg-surface-2 border border-[rgba(255,255,255,0.08)] rounded-2xl p-7 mb-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-3 mb-4">Business model</h2>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Free', items: ['Full worker profile', 'Browse & search', 'Direct messaging', 'Trust Score display'] },
            { label: 'Premium (coming)', items: ['Spotlight placement', 'Featured listing badge', 'Priority verification', 'Employer shortlist tools'] },
          ].map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs text-text-3 uppercase tracking-wider mb-2">{label}</p>
              <ul className="flex flex-col gap-1">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-text-2 font-light">
                    <span className="text-green text-xs">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/" className="inline-flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
          Browse tradies
        </Link>
        <Link href="/get-listed" className="inline-flex items-center gap-2 bg-surface-2 border border-[rgba(255,255,255,0.12)] text-text-2 px-5 py-2.5 rounded-full text-sm font-medium hover:text-text transition-colors">
          Get listed — free
        </Link>
      </div>
    </div>
  );
}
