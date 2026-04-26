'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

const inputClass =
  'w-full px-3 py-2.5 bg-surface-2 border border-[rgba(255,255,255,0.12)] rounded-sm text-sm text-text ' +
  'placeholder:text-text-3 focus:outline-none focus:border-blue/50 transition-colors font-sans';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`${inputClass} ${className}`} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => (
    <textarea ref={ref} className={`${inputClass} resize-none ${className}`} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputClass} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function FormField({
  label,
  error,
  children,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-medium uppercase tracking-widest text-text-3">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}
