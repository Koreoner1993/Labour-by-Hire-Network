'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea, FormField } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Worker } from '@/lib/types';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  worker: Worker;
  onSaved: (w: Worker) => void;
}

export default function EditProfileModal({ open, onClose, worker, onSaved }: EditProfileModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: worker.first_name,
    lastName: worker.last_name,
    city: worker.city,
    hourlyRate: String(worker.hourly_rate || ''),
    bio: worker.bio || '',
    licenceNumber: worker.licence_number || '',
    whiteCard: worker.white_card || '',
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api<{ worker: Worker }>('PUT', '/api/auth/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        city: form.city,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : 0,
        bio: form.bio,
        licenceNumber: form.licenceNumber,
        whiteCard: form.whiteCard,
      }, token ?? undefined);
      onSaved(data.worker);
      toast('Profile updated!');
      onClose();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Update failed', 'err');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-light tracking-tight mb-6">Edit profile</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name *">
            <Input value={form.firstName} onChange={set('firstName')} required />
          </FormField>
          <FormField label="Last name *">
            <Input value={form.lastName} onChange={set('lastName')} required />
          </FormField>
        </div>
        <FormField label="City / Region">
          <Input placeholder="Sydney NSW" value={form.city} onChange={set('city')} />
        </FormField>
        <FormField label="Hourly rate (AUD)">
          <Input type="number" placeholder="85" value={form.hourlyRate} onChange={set('hourlyRate')} min={0} />
        </FormField>
        <FormField label="Licence number">
          <Input placeholder="NSW-BLD-123456" value={form.licenceNumber} onChange={set('licenceNumber')} />
        </FormField>
        <FormField label="White Card number">
          <Input placeholder="WC-123456" value={form.whiteCard} onChange={set('whiteCard')} />
        </FormField>
        <FormField label="Bio">
          <Textarea rows={4} value={form.bio} onChange={set('bio')} />
        </FormField>
        <Button type="submit" loading={loading} className="w-full">Save changes</Button>
      </form>
    </Modal>
  );
}
