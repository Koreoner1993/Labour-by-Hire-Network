'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea, FormField } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Listing } from '@/lib/types';

interface CreateListingModalProps {
  open: boolean;
  onClose: () => void;
  existing: Listing | null;
  onSaved: (l: Listing) => void;
}

export default function CreateListingModal({ open, onClose, existing, onSaved }: CreateListingModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    skills: existing?.skills ?? [] as string[],
    availability: existing?.availability ?? '',
  });

  const set = (k: 'title' | 'description' | 'availability') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  function addSkill() {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    }
    setSkillInput('');
  }

  function removeSkill(s: string) {
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ listing: Listing }>('POST', '/api/auth/listing', form, token ?? undefined);
      onSaved(data.listing);
      toast(existing ? 'Listing updated!' : 'Listing created!');
      onClose();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to save listing', 'err');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-light tracking-tight mb-6">
        {existing ? 'Edit listing' : 'Create listing'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Title *">
          <Input placeholder="Carpenter available for residential builds" value={form.title} onChange={set('title')} required />
        </FormField>
        <FormField label="Description">
          <Textarea rows={3} placeholder="Describe your experience and what work you're looking for…" value={form.description} onChange={set('description')} />
        </FormField>
        <FormField label="Availability">
          <Input placeholder="Available Mon–Fri, full time from July" value={form.availability} onChange={set('availability')} />
        </FormField>
        <FormField label="Skills">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill…"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
          </div>
          {form.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.skills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="text-[10px] bg-surface-3 border border-[rgba(255,255,255,0.08)] text-text-3 px-2 py-0.5 rounded-full hover:text-red hover:border-red/30 transition-colors"
                >
                  {s} ×
                </button>
              ))}
            </div>
          )}
        </FormField>
        <Button type="submit" loading={loading} className="w-full">
          {existing ? 'Update listing' : 'Publish listing'}
        </Button>
      </form>
    </Modal>
  );
}
