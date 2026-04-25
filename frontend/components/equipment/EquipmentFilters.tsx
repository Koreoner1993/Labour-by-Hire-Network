'use client';

import { EQUIP_CATS } from '@/lib/constants';

interface EquipmentFiltersProps {
  active: string;
  onSelect: (cat: string) => void;
}

export default function EquipmentFilters({ active, onSelect }: EquipmentFiltersProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {EQUIP_CATS.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-100 cursor-pointer border',
            active === cat
              ? 'bg-blue text-white border-blue/50'
              : 'bg-surface-2 text-text-3 border-[rgba(255,255,255,0.08)] hover:text-text-2 hover:border-[rgba(255,255,255,0.14)]',
          ].join(' ')}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
