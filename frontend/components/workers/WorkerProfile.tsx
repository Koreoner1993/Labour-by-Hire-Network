'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Worker, Listing } from '@/lib/types';
import { Avatar } from '@/components/workers/WorkerCard';
import TrustScoreBar from '@/components/ui/TrustScoreBar';
import SiteStatusBadge from '@/components/ui/SiteStatusBadge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ComposeModal from '@/components/modals/ComposeModal';

interface WorkerProfileProps {
  worker: Worker;
  listing: Listing | null;
}

export default function WorkerProfile({ worker, listing }: WorkerProfileProps) {
  const [compose, setCompose] = useState(false);
  const memberSince = new Date(worker.created_at).getFullYear();

  return (
    <>
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors mb-8">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to browse
        </Link>

        {/* Header card */}
        <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-7 mb-4">
          <div className="flex items-start gap-4 mb-6">
            <Avatar name={worker.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-light tracking-tight text-text mb-1">{worker.name}</h1>
              <p className="text-xs text-text-3 uppercase tracking-wider">
                {worker.trade} · {worker.city} · Member since {memberSince}
              </p>
            </div>
            {worker.hourly_rate > 0 && (
              <div className="text-right shrink-0">
                <div className="text-2xl font-light text-text">${worker.hourly_rate}</div>
                <div className="text-xs text-text-3">per hour</div>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="green">LBH Verified</Badge>
            {worker.licence_verified && <Badge variant="green">✓ Licence</Badge>}
            {worker.white_card_verified && <Badge variant="blue">✓ White Card</Badge>}
            <SiteStatusBadge
              score={worker.labour_score}
              licVerified={worker.licence_verified}
              wcVerified={worker.white_card_verified}
            />
          </div>

          {/* Trust score */}
          <div className="mb-6">
            <TrustScoreBar score={worker.labour_score} />
          </div>

          {/* Bio */}
          {worker.bio && (
            <p className="text-sm text-text-2 leading-relaxed font-light border-t border-[rgba(255,255,255,0.06)] pt-5 mb-6">
              {worker.bio}
            </p>
          )}

          {/* Listing */}
          {listing && (
            <div className="bg-surface-2 rounded-xl p-4 mb-6 border border-[rgba(255,255,255,0.06)]">
              <h3 className="text-xs font-medium uppercase tracking-widest text-text-3 mb-2">Current listing</h3>
              <p className="text-sm font-medium text-text mb-1">{listing.title}</p>
              {listing.availability && (
                <p className="text-xs text-green">{listing.availability}</p>
              )}
              {listing.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {listing.skills.map((s) => (
                    <span key={s} className="text-[10px] bg-surface-3 border border-[rgba(255,255,255,0.08)] text-text-3 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => setCompose(true)} className="flex-1">
              Message worker
            </Button>
            <Button variant="secondary" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>

      <ComposeModal
        open={compose}
        onClose={() => setCompose(false)}
        workerId={worker.id}
        workerName={worker.name}
      />
    </>
  );
}
