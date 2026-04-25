'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { TRADES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select, FormField } from '@/components/ui/Input';
import type { AuthResponse } from '@/lib/types';

type Step1 = { firstName: string; lastName: string; email: string; password: string; trade: string; city: string };
type Step2 = { hourlyRate: string; licenceNumber: string; whiteCard: string; bio: string };

const TRADE_OPTIONS = TRADES.filter((t) => t !== 'All');

export default function GetListedPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [s1, setS1] = useState<Step1>({ firstName: '', lastName: '', email: '', password: '', trade: '', city: '' });
  const [s2, setS2] = useState<Step2>({ hourlyRate: '', licenceNumber: '', whiteCard: '', bio: '' });

  const set1 = (k: keyof Step1) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setS1((p) => ({ ...p, [k]: e.target.value }));
  const set2 = (k: keyof Step2) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS2((p) => ({ ...p, [k]: e.target.value }));

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!s1.trade) { toast('Please select your trade', 'err'); return; }
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        firstName: s1.firstName,
        lastName: s1.lastName,
        email: s1.email,
        password: s1.password,
        trade: s1.trade,
        city: s1.city,
        hourlyRate: s2.hourlyRate ? parseFloat(s2.hourlyRate) : 0,
        licenceNumber: s2.licenceNumber || undefined,
        whiteCard: s2.whiteCard || undefined,
        bio: s2.bio || undefined,
      };
      const data = await api<AuthResponse>('POST', '/api/auth/register', payload);
      loginWithToken(data.token, data.worker);
      toast(`Welcome, ${data.worker.first_name}! Your profile is live.`);
      router.push('/dashboard');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Registration failed', 'err');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-surface-2 border border-[rgba(255,255,255,0.08)] text-text-3 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest mb-4">
            Step {step} of 2
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-2">
            {step === 1 ? 'Get listed — free' : 'Your trade details'}
          </h1>
          <p className="text-sm text-text-3 font-light">
            {step === 1
              ? 'Create your verified tradie profile in under 2 minutes.'
              : 'Add credentials to boost your Trust Score and get noticed.'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-colors ${n <= step ? 'bg-blue' : 'bg-surface-3'}`}
            />
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First name *">
                <Input placeholder="Jane" value={s1.firstName} onChange={set1('firstName')} required />
              </FormField>
              <FormField label="Last name *">
                <Input placeholder="Smith" value={s1.lastName} onChange={set1('lastName')} required />
              </FormField>
            </div>
            <FormField label="Email *">
              <Input type="email" placeholder="jane@email.com" value={s1.email} onChange={set1('email')} required />
            </FormField>
            <FormField label="Password *">
              <Input type="password" placeholder="Min. 8 characters" value={s1.password} onChange={set1('password')} required minLength={8} />
            </FormField>
            <FormField label="Trade *">
              <Select value={s1.trade} onChange={set1('trade')} required>
                <option value="">Select your trade…</option>
                {TRADE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="City / Region *">
              <Input placeholder="Sydney NSW" value={s1.city} onChange={set1('city')} required />
            </FormField>
            <Button type="submit" className="w-full mt-2">
              Continue
            </Button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="flex flex-col gap-4">
            <FormField label="Hourly rate (AUD)">
              <Input type="number" placeholder="85" value={s2.hourlyRate} onChange={set2('hourlyRate')} min={0} max={500} />
            </FormField>
            <FormField label="Licence number">
              <Input placeholder="NSW-BLD-123456" value={s2.licenceNumber} onChange={set2('licenceNumber')} />
            </FormField>
            <FormField label="White Card number">
              <Input placeholder="WC-123456" value={s2.whiteCard} onChange={set2('whiteCard')} />
            </FormField>
            <FormField label="Bio">
              <Textarea
                placeholder="Briefly describe your experience, specialties, and availability…"
                rows={4}
                value={s2.bio}
                onChange={set2('bio')}
              />
            </FormField>
            <div className="flex gap-3 mt-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Create my profile
              </Button>
            </div>
          </form>
        )}

        <p className="text-xs text-text-3 text-center mt-6">
          Already listed?{' '}
          <button
            type="button"
            className="text-blue-bright hover:underline"
            onClick={() => toast('Use the Sign in button in the nav', 'info')}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
