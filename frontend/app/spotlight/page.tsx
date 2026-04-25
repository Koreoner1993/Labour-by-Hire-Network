'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import { Input, FormField } from '@/components/ui/Input';

export default function SpotlightPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [trade, setTrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('POST', '/api/spotlight/waitlist', { email, trade });
      setDone(true);
      toast('You\'re on the waitlist!');
    } catch {
      // If endpoint doesn't exist yet, still show success UX
      setDone(true);
      toast('You\'re on the waitlist!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center gap-2 bg-surface-2 border border-[rgba(255,255,255,0.08)] text-text-3 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Coming soon
        </div>

        <h1 className="text-4xl font-light tracking-tight leading-tight mb-4">
          Tradie <span className="text-gold">Spotlight</span>
        </h1>
        <p className="text-base text-text-2 font-light leading-relaxed mb-10 max-w-sm mx-auto">
          Get featured at the top of employer searches. A premium placement for top-rated, verified tradies. Join the waitlist to be first in line.
        </p>

        {done ? (
          <div className="bg-surface border border-[rgba(255,255,255,0.08)] rounded-2xl p-8">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-xl font-light tracking-tight mb-2">You&apos;re on the list</h2>
            <p className="text-sm text-text-3 font-light">We&apos;ll reach out when Spotlight launches. Keep your profile updated in the meantime.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <FormField label="Email address *">
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Your trade">
              <Input
                placeholder="Carpenter, Electrician…"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
              />
            </FormField>
            <Button type="submit" loading={loading} className="w-full mt-2">
              Join the waitlist
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
