import Link from 'next/link';
import type { Equipment } from '@/lib/types';
import { EQUIP_ICONS } from '@/lib/constants';

export default function EquipmentCard({ item }: { item: Equipment }) {
  const icon = EQUIP_ICONS[item.category] ?? EQUIP_ICONS.default;

  return (
    <Link
      href={`/equipment/${item.id}`}
      className="block bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:border-[rgba(255,255,255,0.16)] transition-colors group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text truncate group-hover:text-blue-bright transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-text-3 mt-0.5">{item.category}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-base font-light text-text">${item.daily_rate}</div>
          <div className="text-[10px] text-text-3">per day</div>
        </div>
      </div>

      {item.description && (
        <p className="text-xs text-text-3 font-light line-clamp-2 mb-3">{item.description}</p>
      )}

      <div className="flex items-center gap-3 text-[10px] text-text-3 uppercase tracking-wider">
        {item.location && <span>{item.location}</span>}
        {item.condition && <span className="text-green">{item.condition}</span>}
        {item.availability && <span>{item.availability}</span>}
      </div>
    </Link>
  );
}
