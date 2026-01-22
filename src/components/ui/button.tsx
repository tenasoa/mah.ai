'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm',
  outline:
    'border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm shadow-red-500/25',
  success:
    'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm shadow-emerald-500/25',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3.5 text-base gap-2.5 rounded-xl',
  icon: 'p-2.5 rounded-xl',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  icon: 'w-5 h-5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={twMerge(
          clsx(
            // Base styles
            'inline-flex items-center justify-center font-semibold transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
            'transform hover:-translate-y-0.5 active:translate-y-0',
            // Variant styles
            variantStyles[variant],
            // Size styles
            sizeStyles[size],
            // Full width
            fullWidth && 'w-full',
            // Custom className
            className
          )
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className={clsx('animate-spin', iconSizes[size])} />
            {size !== 'icon' && <span>Chargement...</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={clsx('flex-shrink-0', iconSizes[size])}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className={clsx('flex-shrink-0', iconSizes[size])}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
