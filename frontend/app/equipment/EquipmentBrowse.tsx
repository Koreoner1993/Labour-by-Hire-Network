'use client';

import { useState, useMemo } from 'react';
import type { Equipment } from '@/lib/types';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import EquipmentFilters from '@/components/equipment/EquipmentFilters';
import { Input } from '@/components/ui/Input';

export default function EquipmentBrowse({ items }: { items: Equipment[] }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) => {
      const matchCat = filter === 'All' || item.category === filter;
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.location ?? '').toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, filter, search]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <Input
          placeholder="Search equipment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <EquipmentFilters active={filter} onSelect={setFilter} />
      </div>

      <div className="text-xs text-text-3 mb-4 uppercase tracking-wider">
        {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-3 text-sm">
          No equipment found matching your search.
        </div>
      )}
    </div>
  );
}
