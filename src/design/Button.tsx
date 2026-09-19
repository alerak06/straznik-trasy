import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

type Variant = 'filled' | 'tinted' | 'gray' | 'destructive' | 'plain';
type Size = 'lg' | 'md';

const VARIANT: Record<Variant, string> = {
  filled: 'bg-accent text-accent-ink',
  tinted: 'bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-accent',
  gray: 'bg-fill-2 text-label',
  destructive: 'bg-[color-mix(in_srgb,var(--red)_16%,transparent)] text-red',
  plain: 'bg-transparent text-accent',
};

const SIZE: Record<Size, string> = {
  lg: 'h-[54px] px-6 text-headline',
  md: 'h-11 px-4 text-subhead',
};

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'filled', size = 'lg', icon, block, className = '', children, ...rest }: ButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={rest.disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', duration: 0.22, bounce: 0.1 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold disabled:opacity-40 ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}
