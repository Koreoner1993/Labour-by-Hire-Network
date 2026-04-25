import { getTrustLabel } from '@/lib/constants';

interface TrustScoreBarProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

function getScoreColor(score: number) {
  if (score >= 75) return '#00c896';
  if (score >= 50) return '#4d9fff';
  if (score >= 30) return '#f0a500';
  return '#52525b';
}

export default function TrustScoreBar({ score, showLabel = true, size = 'md' }: TrustScoreBarProps) {
  const color = getScoreColor(score);
  const pct = Math.min(100, Math.max(0, score));

  return (
    <div className={size === 'sm' ? 'space-y-1' : 'space-y-1.5'}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest text-text-3">Trust Score</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium" style={{ color }}>{score}</span>
            <span className="text-[10px] text-text-3">· {getTrustLabel(score)}</span>
          </div>
        </div>
      )}
      <div className={`w-full bg-surface-3 rounded-full ${size === 'sm' ? 'h-1' : 'h-1.5'}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
