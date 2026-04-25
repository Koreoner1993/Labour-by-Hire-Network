'use client';

import { useState, useMemo } from 'react';
import type { Listing } from '@/lib/types';
import WorkerCard from '@/components/workers/WorkerCard';
import TradeFilters from '@/components/workers/TradeFilters';
import { Input } from '@/components/ui/Input';

export default function WorkerBrowse({ listings }: { listings: Listing[] }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter((l) => {
      const w = l.worker!;
      const matchTrade = filter === 'All' || w.trade === filter;
      const matchSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.trade.toLowerCase().includes(q) ||
        (w.city ?? '').toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q);
      return matchTrade && matchSearch;
    });
  }, [listings, filter, search]);

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col gap-4 mb-8">
        <Input
          placeholder="Search by name, trade, or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <TradeFilters active={filter} onSelect={setFilter} />
      </div>

      {/* Results count */}
      <div className="text-xs text-text-3 mb-4 uppercase tracking-wider">
        {filtered.length} worker{filtered.length !== 1 ? 's' : ''} found
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((listing) => (
            <WorkerCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-3 text-sm">
          No workers found matching your search.
        </div>
      )}
    </div>
  );
}
