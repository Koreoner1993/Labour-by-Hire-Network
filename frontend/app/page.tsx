import type { Metadata } from 'next';
import Link from 'next/link';
import type { Listing } from '@/lib/types';
import WorkerBrowse from './workers/WorkerBrowse';

export const metadata: Metadata = {
  title: 'Browse Verified Tradies — Labour by Hire',
  description:
    'Find licence-checked, White Card verified tradies across Australia. Filter by trade, location and Trust Score.',
};

async function getListings(): Promise<Listing[]> {
  try {
    const res = await fetch(
      `${process.env.API_URL || 'https://labour-by-hire-network-production.up.railway.app'}/api/listings`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.listings ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const listings = await getListings();

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-surface-2 border border-[rgba(255,255,255,0.08)] text-text-3 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          Australia&apos;s Construction Workforce Network
        </div>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-4">
          Find verified tradies<br />
          <span className="text-blue-bright">ready to work</span>
        </h1>
        <p className="text-base text-text-2 max-w-xl font-light leading-relaxed mb-8">
          Every tradie is licence-checked, White Card verified, and rated with a Trust Score.
          Browse free — no account needed.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/get-listed"
            className="inline-flex items-center gap-2 bg-blue text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get listed — free
          </Link>
          <Link
            href="/employers"
            className="inline-flex items-center gap-2 bg-surface-2 border border-[rgba(255,255,255,0.12)] text-text-2 px-5 py-2.5 rounded-full text-sm font-medium hover:text-text transition-colors"
          >
            Employer access
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden mb-12">
        {[
          { n: `${listings.length}+`, l: 'Verified tradies' },
          { n: 'Free', l: 'To browse & contact' },
          { n: '24hr', l: 'Verification time' },
        ].map(({ n, l }) => (
          <div key={l} className="bg-bg px-6 py-4 text-center">
            <div className="text-2xl font-light text-text mb-1">{n}</div>
            <div className="text-[10px] text-text-3 uppercase tracking-widest">{l}</div>
          </div>
        ))}
      </div>

      {/* Browse */}
      <WorkerBrowse listings={listings} />
    </div>
  );
}
