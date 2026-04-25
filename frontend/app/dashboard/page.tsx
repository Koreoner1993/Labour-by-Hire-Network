'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import type { Worker, Listing, Message } from '@/lib/types';
import { Avatar } from '@/components/workers/WorkerCard';
import TrustScoreBar from '@/components/ui/TrustScoreBar';
import SiteStatusBadge from '@/components/ui/SiteStatusBadge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EditProfileModal from '@/components/modals/EditProfileModal';
import CreateListingModal from '@/components/modals/CreateListingModal';

export default function DashboardPage() {
  const router = useRouter();
  const { token, worker: authWorker, isLoading } = useAuth();
  const { toast } = useToast();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [listingOpen, setListingOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) router.replace('/get-listed');
  }, [isLoading, token, router]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [profile, inbox] = await Promise.all([
          api<{ worker: Worker; listing: Listing | null }>('GET', '/api/auth/profile', undefined, token),
          api<{ messages: Message[] }>('GET', '/api/messages', undefined, token),
        ]);
        setWorker(profile.worker);
        setListing(profile.listing);
        setMessages(inbox.messages);
      } catch {
        toast('Failed to load dashboard', 'err');
      } finally {
        setFetching(false);
      }
    })();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function markRead(id: number) {
    try {
      await api('PUT', `/api/messages/${id}/read`, undefined, token ?? undefined);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    } catch {
      // silently fail — message still shows
    }
  }

  if (isLoading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) return null;

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-tight">Dashboard</h1>
        <Button variant="ghost" onClick={() => router.push('/')}>Browse tradies</Button>
      </div>

      {/* Profile card */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-4">
        <div className="flex items-start gap-4 mb-5">
          <Avatar name={worker.name ?? `${worker.first_name} ${worker.last_name}`} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-light tracking-tight">{worker.first_name} {worker.last_name}</h2>
            <p className="text-xs text-text-3 uppercase tracking-wider mt-0.5">
              {worker.trade} · {worker.city}
            </p>
            {worker.email && <p className="text-xs text-text-3 mt-1">{worker.email}</p>}
          </div>
          {worker.hourly_rate > 0 && (
            <div className="text-right shrink-0">
              <div className="text-xl font-light">${worker.hourly_rate}</div>
              <div className="text-xs text-text-3">per hour</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <Badge variant="green">LBH Verified</Badge>
          {worker.licence_number && <Badge variant="green">✓ Licence</Badge>}
          {worker.white_card && <Badge variant="blue">✓ White Card</Badge>}
          <SiteStatusBadge
            score={worker.labour_score}
            licVerified={!!worker.licence_number}
            wcVerified={!!worker.white_card}
          />
        </div>

        <TrustScoreBar score={worker.labour_score} />

        {worker.bio && (
          <p className="text-sm text-text-2 font-light leading-relaxed border-t border-[rgba(255,255,255,0.06)] pt-4 mt-5">
            {worker.bio}
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <Button onClick={() => setEditOpen(true)} variant="secondary" className="flex-1">Edit profile</Button>
          <Button variant="ghost" onClick={() => router.push(`/workers/${worker.id}`)}>View public profile</Button>
        </div>
      </div>

      {/* Listing card */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium uppercase tracking-widest text-text-3">Your listing</h3>
          <Button size="sm" variant="secondary" onClick={() => setListingOpen(true)}>
            {listing ? 'Edit' : 'Create listing'}
          </Button>
        </div>

        {listing ? (
          <div>
            <p className="text-sm font-medium text-text mb-1">{listing.title}</p>
            {listing.availability && <p className="text-xs text-green mb-2">{listing.availability}</p>}
            {listing.description && <p className="text-xs text-text-3 font-light mb-3">{listing.description}</p>}
            {listing.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {listing.skills.map((s) => (
                  <span key={s} className="text-[10px] bg-surface-3 border border-[rgba(255,255,255,0.08)] text-text-3 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-3 font-light">
            No listing yet. Create one to appear in employer searches and boost your Trust Score.
          </p>
        )}
      </div>

      {/* Inbox */}
      <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium uppercase tracking-widest text-text-3">
            Inbox {unread > 0 && <span className="ml-1.5 bg-blue text-white text-[10px] px-1.5 py-0.5 rounded-full">{unread}</span>}
          </h3>
          <span className="text-xs text-text-3">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-text-3 font-light">No messages yet. Share your profile link to start receiving enquiries.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl p-4 border transition-colors ${
                  m.read
                    ? 'bg-surface-2 border-[rgba(255,255,255,0.05)]'
                    : 'bg-blue/5 border-blue/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-sm font-medium text-text">{m.from_name}</span>
                    {m.company && <span className="text-xs text-text-3 ml-2">· {m.company}</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-text-3">{new Date(m.time).toLocaleDateString('en-AU')}</span>
                    {!m.read && (
                      <button
                        onClick={() => markRead(m.id)}
                        className="text-[10px] text-blue hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-3 mb-2">{m.from_email}</p>
                <p className="text-sm text-text-2 font-light leading-relaxed whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        worker={worker}
        onSaved={(w) => setWorker(w)}
      />
      <CreateListingModal
        open={listingOpen}
        onClose={() => setListingOpen(false)}
        existing={listing}
        onSaved={(l) => setListing(l)}
      />
    </div>
  );
}
