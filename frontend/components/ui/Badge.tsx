interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'gold' | 'red' | 'default';
  className?: string;
}

const variants = {
  green: 'bg-green/8 text-green border-green/20',
  blue: 'bg-blue/8 text-blue-bright border-blue/20',
  gold: 'bg-gold/8 text-gold border-gold/20',
  red: 'bg-red/8 text-red border-red/20',
  default: 'bg-surface-2 text-text-3 border-[rgba(255,255,255,0.12)]',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full',
        'text-[10px] font-medium uppercase tracking-widest border',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
