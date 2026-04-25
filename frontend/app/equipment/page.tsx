import type { Metadata } from 'next';
import type { Equipment } from '@/lib/types';
import EquipmentBrowse from './EquipmentBrowse';

export const metadata: Metadata = {
  title: 'Browse Equipment — Labour by Hire',
  description: 'Find construction equipment for hire across Australia. Cranes, EWP, excavators, scaffolding and more.',
};

const API_URL = process.env.API_URL || 'https://labour-by-hire-network-production.up.railway.app';

async function getEquipment(): Promise<Equipment[]> {
  try {
    const res = await fetch(`${API_URL}/api/equipment`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.equipment ?? [];
  } catch {
    return [];
  }
}

export default async function EquipmentPage() {
  const items = await getEquipment();

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-light tracking-tight mb-3">Equipment hire</h1>
        <p className="text-base text-text-2 font-light max-w-xl">
          Browse construction equipment available for hire from verified tradie owners.
        </p>
      </div>
      <EquipmentBrowse items={items} />
    </div>
  );
}
