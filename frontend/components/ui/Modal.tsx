'use client';

import { useEffect, ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`relative w-full ${maxWidth} bg-surface border border-[rgba(255,255,255,0.12)] rounded-2xl p-7 shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-3 hover:text-text text-xl leading-none cursor-pointer bg-none border-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
