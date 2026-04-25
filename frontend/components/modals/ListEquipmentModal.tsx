'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea, Select, FormField } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { EQUIP_CATS } from '@/lib/constants';
import type { Equipment } from '@/lib/types';

interface ListEquipmentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (item: Equipment) => void;
}

const EQUIP_OPTIONS = EQUIP_CATS.filter((c) => c !== 'All');
const CONDITIONS = ['Excellent', 'Good', 'Fair'];

export default function ListEquipmentModal({ open, onClose, onCreated }: ListEquipmentModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    daily_rate: '',
    location: '',
    condition: 'Good',
    availability: '',
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) { toast('Please select a category', 'err'); return; }
    setLoading(true);
    try {
      const data = await api<{ equipment: Equipment }>('POST', '/api/equipment', {
        ...form,
        daily_rate: parseFloat(form.daily_rate),
      }, token ?? undefined);
      onCreated(data.equipment);
      toast('Equipment listed!');
      onClose();
      setForm({ title: '', category: '', description: '', daily_rate: '', location: '', condition: 'Good', availability: '' });
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to list equipment', 'err');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-light tracking-tight mb-6">List equipment for hire</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Title *">
          <Input placeholder="20T Franna Crane" value={form.title} onChange={set('title')} required />
        </FormField>
        <FormField label="Category *">
          <Select value={form.category} onChange={set('category')} required>
            <option value="">Select category…</option>
            {EQUIP_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Daily rate (AUD) *">
            <Input type="number" placeholder="350" value={form.daily_rate} onChange={set('daily_rate')} required min={1} />
          </FormField>
          <FormField label="Condition">
            <Select value={form.condition} onChange={set('condition')}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Location">
          <Input placeholder="Sydney NSW" value={form.location} onChange={set('location')} />
        </FormField>
        <FormField label="Availability">
          <Input placeholder="Available weekdays" value={form.availability} onChange={set('availability')} />
        </FormField>
        <FormField label="Description">
          <Textarea rows={3} placeholder="Specs, inclusions, any conditions of hire…" value={form.description} onChange={set('description')} />
        </FormField>
        <Button type="submit" loading={loading} className="w-full">List equipment</Button>
      </form>
    </Modal>
  );
}
