'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

type InputVariant = 'default' | 'filled' | 'outline';
type InputSize = 'sm' | 'md' | 'lg';
type InputState = 'default' | 'error' | 'success';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<InputVariant, string> = {
  default:
    'bg-slate-50 border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100',
  filled:
    'bg-slate-100 border-transparent focus:bg-slate-50 focus:border-amber-400 focus:ring-4 focus:ring-amber-100',
  outline:
    'bg-transparent border-slate-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100',
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg',
  md: 'px-4 py-3 text-sm rounded-xl',
  lg: 'px-5 py-4 text-base rounded-xl',
};

const iconSizeStyles: Record<InputSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const iconPaddingLeft: Record<InputSize, string> = {
  sm: 'pl-8',
  md: 'pl-11',
  lg: 'pl-14',
};

const iconPaddingRight: Record<InputSize, string> = {
  sm: 'pr-8',
  md: 'pr-11',
  lg: 'pr-14',
};

const iconPositionLeft: Record<InputSize, string> = {
  sm: 'left-2.5',
  md: 'left-4',
  lg: 'left-5',
};

const iconPositionRight: Record<InputSize, string> = {
  sm: 'right-2.5',
  md: 'right-4',
  lg: 'right-5',
};

const stateStyles: Record<InputState, { input: string; icon: string; text: string }> = {
  default: {
    input: '',
    icon: 'text-slate-400 group-focus-within:text-amber-500',
    text: 'text-slate-500',
  },
  error: {
    input: 'border-red-400 focus:border-red-400 focus:ring-red-100',
    icon: 'text-red-400',
    text: 'text-red-500',
  },
  success: {
    input: 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-100',
    icon: 'text-emerald-500',
    text: 'text-emerald-600',
  },
};

const labelSizeStyles: Record<InputSize, string> = {
  sm: 'text-xs mb-1',
  md: 'text-xs mb-1.5',
  lg: 'text-sm mb-2',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      state = 'default',
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = state === 'error' || !!errorMessage;
    const currentState = hasError ? 'error' : state;
    const displayMessage = errorMessage || helperText;

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'font-semibold text-slate-600',
              labelSizeStyles[size],
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <span
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none',
                iconPositionLeft[size],
                iconSizeStyles[size],
                stateStyles[currentState].icon
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={twMerge(
              clsx(
                // Base styles
                'w-full border text-slate-900 placeholder:text-slate-400',
                'outline-none transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100',
                // Variant styles
                variantStyles[variant],
                // Size styles
                sizeStyles[size],
                // State styles
                stateStyles[currentState].input,
                // Icon padding
                leftIcon && iconPaddingLeft[size],
                rightIcon && iconPaddingRight[size],
                // Custom className
                className
              )
            )}
            aria-invalid={hasError}
            aria-describedby={displayMessage ? `${inputId}-helper` : undefined}
            {...props}
          />

          {rightIcon && (
            <span
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none',
                iconPositionRight[size],
                iconSizeStyles[size],
                stateStyles[currentState].icon
              )}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {displayMessage && (
          <p
            id={`${inputId}-helper`}
            className={clsx(
              'mt-1.5 text-xs',
              stateStyles[currentState].text,
              disabled && 'opacity-50'
            )}
          >
            {displayMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
