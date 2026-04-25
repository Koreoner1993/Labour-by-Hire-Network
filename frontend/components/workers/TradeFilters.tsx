'use client';

import { TRADES } from '@/lib/constants';

interface TradeFiltersProps {
  active: string;
  onSelect: (trade: string) => void;
}

export default function TradeFilters({ active, onSelect }: TradeFiltersProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {TRADES.map((trade) => (
        <button
          key={trade}
          onClick={() => onSelect(trade)}
          className={[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-100 cursor-pointer border',
            active === trade
              ? 'bg-blue text-white border-blue/50'
              : 'bg-surface-2 text-text-3 border-[rgba(255,255,255,0.08)] hover:text-text-2 hover:border-[rgba(255,255,255,0.14)]',
          ].join(' ')}
        >
          {trade}
        </button>
      ))}
    </div>
  );
}
