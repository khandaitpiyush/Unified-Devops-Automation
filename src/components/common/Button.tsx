import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 disabled:opacity-50 disabled:pointer-events-none rounded-md select-none border';

    const variants = {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 border-primary-600 shadow-sm active:bg-primary-800',
      secondary:
        'bg-white text-slate-800 hover:bg-slate-50 border-border hover:border-slate-300 shadow-subtle active:bg-slate-100',
      outline:
        'bg-transparent text-slate-700 hover:bg-slate-100/70 border-border hover:text-slate-900',
      danger:
        'bg-red-50 text-red-600 hover:bg-red-100 border-red-200 focus:ring-red-500/20 active:bg-red-200/60',
      ghost:
        'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent',
    };

    const sizes = {
      xs: 'text-[11px] px-2 py-1 gap-1',
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-xs px-3 py-2 gap-2 font-semibold',
      lg: 'text-sm px-4 py-2.5 gap-2 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
