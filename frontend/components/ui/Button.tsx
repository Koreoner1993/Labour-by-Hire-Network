'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:opacity-90 border border-blue/30',
  secondary: 'bg-surface-2 text-text-2 hover:text-text border border-border-2 hover:border-border-2',
  ghost: 'bg-transparent text-text-3 hover:text-text border border-transparent',
  danger: 'bg-red/10 text-red border border-red/20 hover:bg-red/20',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-full',
        'transition-all duration-150 cursor-pointer whitespace-nowrap',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
