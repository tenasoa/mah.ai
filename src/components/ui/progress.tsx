'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type ProgressVariant = 'default' | 'gradient' | 'striped' | 'animated';
type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
type ProgressColor = 'amber' | 'indigo' | 'emerald' | 'pink' | 'cyan' | 'red' | 'slate';

interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  color?: ProgressColor;
  showValue?: boolean;
  valuePosition?: 'inside' | 'outside' | 'top';
  label?: string;
  animated?: boolean;
  rounded?: boolean;
}

const sizeStyles: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const trackColors: Record<ProgressColor, string> = {
  amber: 'bg-amber-100',
  indigo: 'bg-indigo-100',
  emerald: 'bg-emerald-100',
  pink: 'bg-pink-100',
  cyan: 'bg-cyan-100',
  red: 'bg-red-100',
  slate: 'bg-slate-100',
};

const barColors: Record<ProgressColor, string> = {
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
  red: 'bg-red-500',
  slate: 'bg-slate-500',
};

const gradientColors: Record<ProgressColor, string> = {
  amber: 'bg-gradient-to-r from-amber-400 to-orange-500',
  indigo: 'bg-gradient-to-r from-indigo-400 to-purple-500',
  emerald: 'bg-gradient-to-r from-emerald-400 to-teal-500',
  pink: 'bg-gradient-to-r from-pink-400 to-rose-500',
  cyan: 'bg-gradient-to-r from-cyan-400 to-blue-500',
  red: 'bg-gradient-to-r from-red-400 to-orange-500',
  slate: 'bg-gradient-to-r from-slate-400 to-slate-600',
};

const labelSizes: Record<ProgressSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'md',
      color = 'amber',
      showValue = false,
      valuePosition = 'outside',
      label,
      animated = false,
      rounded = true,
      className,
      ...props
    },
    ref
  ) => {
    // Calculate percentage
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayValue = `${Math.round(percentage)}%`;

    // Determine bar color based on variant
    const getBarColor = () => {
      if (variant === 'gradient') {
        return gradientColors[color];
      }
      return barColors[color];
    };

    // Striped pattern styles
    const stripedStyles =
      variant === 'striped' || variant === 'animated'
        ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)]'
        : '';

    // Animation for striped variant
    const animatedStyles =
      variant === 'animated' || animated
        ? 'animate-[progress-stripes_1s_linear_infinite]'
        : '';

    return (
      <div ref={ref} className={twMerge(clsx('w-full', className))} {...props}>
        {/* Top Label and Value */}
        {(label || (showValue && valuePosition === 'top')) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <span
                className={clsx(
                  'font-medium text-slate-700',
                  labelSizes[size]
                )}
              >
                {label}
              </span>
            )}
            {showValue && valuePosition === 'top' && (
              <span
                className={clsx(
                  'font-semibold text-slate-600',
                  labelSizes[size]
                )}
              >
                {displayValue}
              </span>
            )}
          </div>
        )}

        {/* Progress Track */}
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'relative flex-1 overflow-hidden',
              sizeStyles[size],
              trackColors[color],
              rounded ? 'rounded-full' : 'rounded-sm'
            )}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label || 'Progress'}
          >
            {/* Progress Bar */}
            <div
              className={clsx(
                'h-full transition-all duration-500 ease-out',
                rounded ? 'rounded-full' : 'rounded-sm',
                getBarColor(),
                stripedStyles,
                animatedStyles
              )}
              style={{ width: `${percentage}%` }}
            >
              {/* Inside Value */}
              {showValue && valuePosition === 'inside' && size === 'lg' && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                  {displayValue}
                </span>
              )}
            </div>
          </div>

          {/* Outside Value */}
          {showValue && valuePosition === 'outside' && (
            <span
              className={clsx(
                'font-semibold text-slate-600 tabular-nums min-w-[3ch]',
                labelSizes[size]
              )}
            >
              {displayValue}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
interface CircularProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: ProgressColor;
  strokeWidth?: number;
  showValue?: boolean;
  label?: string;
  children?: ReactNode;
}

const circularSizes: Record<NonNullable<CircularProgressProps['size']>, number> = {
  sm: 48,
  md: 64,
  lg: 80,
  xl: 120,
};

const circularTextSizes: Record<NonNullable<CircularProgressProps['size']>, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

const circularStrokeColors: Record<ProgressColor, string> = {
  amber: 'stroke-amber-500',
  indigo: 'stroke-indigo-500',
  emerald: 'stroke-emerald-500',
  pink: 'stroke-pink-500',
  cyan: 'stroke-cyan-500',
  red: 'stroke-red-500',
  slate: 'stroke-slate-500',
};

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      color = 'amber',
      strokeWidth = 4,
      showValue = true,
      label,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const displayValue = `${Math.round(percentage)}%`;

    const circleSize = circularSizes[size];
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx('relative inline-flex items-center justify-center', className)
        )}
        style={{ width: circleSize, height: circleSize }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        {...props}
      >
        {/* SVG Circle */}
        <svg
          className="transform -rotate-90"
          width={circleSize}
          height={circleSize}
        >
          {/* Background Circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-200"
          />
          {/* Progress Circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={clsx(
              'transition-all duration-500 ease-out',
              circularStrokeColors[color]
            )}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children ? (
            children
          ) : showValue ? (
            <span
              className={clsx('font-bold text-slate-900', circularTextSizes[size])}
            >
              {displayValue}
            </span>
          ) : null}
          {label && !children && (
            <span className="text-[10px] text-slate-500 mt-0.5">{label}</span>
          )}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

// Multi-segment Progress (for showing multiple values)
interface ProgressSegment {
  value: number;
  color: ProgressColor;
  label?: string;
}

interface MultiProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  segments: ProgressSegment[];
  max?: number;
  size?: ProgressSize;
  showLegend?: boolean;
  rounded?: boolean;
}

export const MultiProgress = forwardRef<HTMLDivElement, MultiProgressProps>(
  (
    {
      segments,
      max = 100,
      size = 'md',
      showLegend = false,
      rounded = true,
      className,
      ...props
    },
    ref
  ) => {
    // Calculate total and percentages
    const total = segments.reduce((sum, seg) => sum + seg.value, 0);
    const normalizedMax = Math.max(max, total);

    return (
      <div ref={ref} className={twMerge(clsx('w-full', className))} {...props}>
        {/* Progress Track */}
        <div
          className={clsx(
            'relative flex overflow-hidden',
            sizeStyles[size],
            'bg-slate-100',
            rounded ? 'rounded-full' : 'rounded-sm'
          )}
          role="progressbar"
          aria-valuenow={total}
          aria-valuemin={0}
          aria-valuemax={normalizedMax}
        >
          {segments.map((segment, index) => {
            const percentage = (segment.value / normalizedMax) * 100;
            return (
              <div
                key={index}
                className={clsx(
                  'h-full transition-all duration-500 ease-out',
                  barColors[segment.color],
                  index === 0 && rounded && 'rounded-l-full',
                  index === segments.length - 1 && rounded && 'rounded-r-full'
                )}
                style={{ width: `${percentage}%` }}
                title={segment.label ? `${segment.label}: ${segment.value}` : undefined}
              />
            );
          })}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex flex-wrap gap-4 mt-3">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className={clsx(
                    'w-3 h-3 rounded-full',
                    barColors[segment.color]
                  )}
                />
                <span className="text-xs text-slate-600">
                  {segment.label || `Segment ${index + 1}`}:{' '}
                  <span className="font-semibold">{segment.value}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MultiProgress.displayName = 'MultiProgress';

export default Progress;
