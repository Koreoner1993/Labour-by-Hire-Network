'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea, FormField } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  workerId: number;
  workerName: string;
}

export default function ComposeModal({ open, onClose, workerId, workerName }: ComposeModalProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({ from_name: '', from_email: '', company: '', body: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('POST', `/messages/${workerId}`, form);
      toast(`Message sent to ${workerName}!`);
      onClose();
      setForm({ from_name: '', from_email: '', company: '', body: '' });
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to send', 'err');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-light tracking-tight mb-1">Message {workerName}</h2>
      <p className="text-xs text-text-3 mb-6">Free — no account required</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Your name *">
            <Input placeholder="Jane Smith" value={form.from_name} onChange={set('from_name')} required />
          </FormField>
          <FormField label="Your email *">
            <Input type="email" placeholder="jane@company.com" value={form.from_email} onChange={set('from_email')} required />
          </FormField>
        </div>
        <FormField label="Company">
          <Input placeholder="ABC Constructions" value={form.company} onChange={set('company')} />
        </FormField>
        <FormField label="Message *">
          <Textarea
            placeholder="Describe the job, location, and timeline…"
            rows={4}
            value={form.body}
            onChange={set('body')}
            required
          />
        </FormField>
        <Button type="submit" loading={loading} className="w-full">
          Send message
        </Button>
      </form>
    </Modal>
  );
}
