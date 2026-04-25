import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Equipment } from '@/lib/types';
import { EQUIP_ICONS } from '@/lib/constants';

const API_URL = process.env.API_URL || 'https://labour-by-hire-network-production.up.railway.app';

async function getItem(id: string): Promise<Equipment | null> {
  try {
    const res = await fetch(`${API_URL}/api/equipment/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.equipment ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return { title: 'Equipment not found | Labour by Hire' };
  return {
    title: `${item.title} — ${item.category} | Labour by Hire`,
    description: item.description ?? `${item.title} available for hire at $${item.daily_rate}/day. ${item.location ?? ''}`,
  };
}

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const icon = EQUIP_ICONS[item.category] ?? EQUIP_ICONS.default;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link href="/equipment" className="inline-flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to equipment
      </Link>

      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-7">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl">{icon}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-light tracking-tight text-text mb-1">{item.title}</h1>
            <p className="text-xs text-text-3 uppercase tracking-wider">{item.category}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-light text-text">${item.daily_rate}</div>
            <div className="text-xs text-text-3">per day</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden mb-6">
          {[
            { label: 'Location', value: item.location || '—' },
            { label: 'Condition', value: item.condition || '—' },
            { label: 'Availability', value: item.availability || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bg px-4 py-3 text-center">
              <div className="text-xs font-light text-text mb-0.5">{value}</div>
              <div className="text-[10px] text-text-3 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {item.description && (
          <p className="text-sm text-text-2 leading-relaxed font-light border-t border-[rgba(255,255,255,0.06)] pt-5 mb-6">
            {item.description}
          </p>
        )}

        {item.owner && (
          <div className="bg-surface-2 rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
            <p className="text-xs text-text-3 uppercase tracking-widest mb-2">Owner</p>
            <Link
              href={`/workers/${item.owner.id}`}
              className="text-sm font-medium text-text hover:text-blue-bright transition-colors"
            >
              {item.owner.name ?? `${item.owner.first_name} ${item.owner.last_name}`}
            </Link>
            <p className="text-xs text-text-3 mt-0.5">{item.owner.trade} · {item.owner.city}</p>
          </div>
        )}
      </div>
    </div>
  );
}
