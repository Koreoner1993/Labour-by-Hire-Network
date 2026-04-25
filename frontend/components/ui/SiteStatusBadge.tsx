import { getSiteStatus } from '@/lib/constants';

export default function SiteStatusBadge({
  score,
  licVerified,
  wcVerified,
}: {
  score: number;
  licVerified: boolean;
  wcVerified: boolean;
}) {
  const status = getSiteStatus(score, licVerified, wcVerified);
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border',
        status.bg, status.color, status.border,
      ].join(' ')}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status.label}
    </span>
  );
}
