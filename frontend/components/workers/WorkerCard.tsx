import Link from 'next/link';
import type { Listing } from '@/lib/types';
import TrustScoreBar from '@/components/ui/TrustScoreBar';
import SiteStatusBadge from '@/components/ui/SiteStatusBadge';

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.trim().split(' ').map((p) => p[0] ?? '').slice(0, 2).join('').toUpperCase();
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-full bg-surface-3 border border-[rgba(255,255,255,0.08)] flex items-center justify-center font-medium text-text-2 shrink-0`}>
      {initials}
    </div>
  );
}

export { Avatar };

export default function WorkerCard({ listing }: { listing: Listing }) {
  const w = listing.worker!;
  return (
    <Link
      href={`/workers/${w.id}`}
      className="group block bg-surface border border-[rgba(255,255,255,0.06)] rounded-xl p-5 hover:border-[rgba(255,255,255,0.14)] transition-all duration-150 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={w.name} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-text truncate">{w.name}</div>
          <div className="text-xs text-text-3 uppercase tracking-wider mt-0.5">
            {w.trade} · {w.city}
          </div>
        </div>
        {w.hourly_rate > 0 && (
          <div className="text-sm font-light text-text-2 shrink-0">
            ${w.hourly_rate}<span className="text-xs text-text-3">/hr</span>
          </div>
        )}
      </div>

      <TrustScoreBar score={w.labour_score} size="sm" />

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <SiteStatusBadge
          score={w.labour_score}
          licVerified={w.licence_verified}
          wcVerified={w.white_card_verified}
        />
        {w.licence_verified && (
          <span className="text-[10px] text-green/80 bg-green/5 border border-green/15 px-2 py-0.5 rounded-full">
            ✓ Licence
          </span>
        )}
        {w.white_card_verified && (
          <span className="text-[10px] text-blue-bright/80 bg-blue/5 border border-blue/15 px-2 py-0.5 rounded-full">
            ✓ White Card
          </span>
        )}
      </div>

      {listing.description && (
        <p className="text-xs text-text-3 mt-3 line-clamp-2 leading-relaxed font-light">
          {listing.description}
        </p>
      )}
    </Link>
  );
}
