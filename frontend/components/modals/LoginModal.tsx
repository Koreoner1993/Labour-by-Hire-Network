'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, FormField } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast('Welcome back!');
      onClose();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-xl font-light tracking-tight mb-6">Sign in to your account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField label="Email">
          <Input
            type="email"
            placeholder="jake@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </FormField>
        <FormField label="Password">
          <Input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormField>
        {error && <p className="text-xs text-red bg-red/5 border border-red/20 rounded-lg px-3 py-2">{error}</p>}
        <Button type="submit" loading={loading} className="w-full mt-1">
          Sign in
        </Button>
        <p className="text-xs text-center text-text-3">
          Not listed yet?{' '}
          <button
            type="button"
            onClick={() => { onClose(); router.push('/get-listed'); }}
            className="text-blue-bright hover:underline cursor-pointer"
          >
            Create your Construction ID
          </button>
        </p>
      </form>
    </Modal>
  );
}
