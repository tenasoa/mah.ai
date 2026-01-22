'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  dot?: boolean;
  dotColor?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  children?: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-slate-100 text-slate-700 border-slate-200',
  primary:
    'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-sm shadow-orange-500/25',
  secondary:
    'bg-slate-900 text-white border-transparent',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200',
  danger:
    'bg-red-50 text-red-700 border-red-200',
  info:
    'bg-indigo-50 text-indigo-700 border-indigo-200',
  outline:
    'bg-transparent text-slate-600 border-slate-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

const iconSizes: Record<BadgeSize, string> = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

const dotSizes: Record<BadgeSize, string> = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

const dotColors: Record<NonNullable<BadgeProps['dotColor']>, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-indigo-500',
};

const radiusStyles = {
  default: 'rounded-md',
  pill: 'rounded-full',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      pill = false,
      dot = false,
      dotColor = 'default',
      leftIcon,
      rightIcon,
      removable = false,
      onRemove,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            // Base styles
            'inline-flex items-center justify-center font-semibold border',
            'whitespace-nowrap transition-all duration-200',
            // Variant styles
            variantStyles[variant],
            // Size styles
            sizeStyles[size],
            // Radius styles
            pill ? radiusStyles.pill : radiusStyles.default,
            // Custom className
            className
          )
        )}
        {...props}
      >
        {/* Status Dot */}
        {dot && (
          <span
            className={clsx(
              'rounded-full flex-shrink-0',
              dotSizes[size],
              dotColors[dotColor]
            )}
          />
        )}

        {/* Left Icon */}
        {leftIcon && !dot && (
          <span className={clsx('flex-shrink-0', iconSizes[size])}>
            {leftIcon}
          </span>
        )}

        {/* Content */}
        {children}

        {/* Right Icon */}
        {rightIcon && !removable && (
          <span className={clsx('flex-shrink-0', iconSizes[size])}>
            {rightIcon}
          </span>
        )}

        {/* Remove Button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={clsx(
              'flex-shrink-0 rounded-full hover:bg-black/10 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400',
              iconSizes[size]
            )}
            aria-label="Supprimer"
          >
            <svg
              viewBox="0 0 14 14"
              fill="currentColor"
              className="w-full h-full"
            >
              <path d="M4.293 4.293a1 1 0 011.414 0L7 5.586l1.293-1.293a1 1 0 111.414 1.414L8.414 7l1.293 1.293a1 1 0 01-1.414 1.414L7 8.414l-1.293 1.293a1 1 0 01-1.414-1.414L5.586 7 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Badge Group Component
interface BadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'normal' | 'loose';
}

const spacingStyles: Record<NonNullable<BadgeGroupProps['spacing']>, string> = {
  tight: 'gap-1',
  normal: 'gap-2',
  loose: 'gap-3',
};

export const BadgeGroup = forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ spacing = 'normal', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex flex-wrap items-center',
            spacingStyles[spacing],
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup';

// Notification Badge - For counters and alerts
interface NotificationBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count?: number;
  max?: number;
  showZero?: boolean;
  variant?: 'primary' | 'danger' | 'success';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  children?: ReactNode;
}

const notificationVariants: Record<NonNullable<NotificationBadgeProps['variant']>, string> = {
  primary: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  danger: 'bg-red-500 text-white',
  success: 'bg-emerald-500 text-white',
};

const positionStyles: Record<NonNullable<NotificationBadgeProps['position']>, string> = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
};

export const NotificationBadge = forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  (
    {
      count,
      max = 99,
      showZero = false,
      variant = 'danger',
      position = 'top-right',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const displayCount = count !== undefined ? (count > max ? `${max}+` : count) : null;
    const shouldShow = showZero || (count !== undefined && count > 0);

    // If there are children, render as a wrapper
    if (children) {
      return (
        <span ref={ref} className="relative inline-flex">
          {children}
          {shouldShow && (
            <span
              className={twMerge(
                clsx(
                  'absolute min-w-[18px] h-[18px] px-1',
                  'flex items-center justify-center',
                  'text-[10px] font-bold rounded-full',
                  'ring-2 ring-white',
                  'transform',
                  notificationVariants[variant],
                  positionStyles[position],
                  className
                )
              )}
              {...props}
            >
              {displayCount}
            </span>
          )}
        </span>
      );
    }

    // Standalone badge
    if (!shouldShow) return null;

    return (
      <span
        ref={ref}
        className={twMerge(
          clsx(
            'min-w-[18px] h-[18px] px-1',
            'inline-flex items-center justify-center',
            'text-[10px] font-bold rounded-full',
            notificationVariants[variant],
            className
          )
        )}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';

export default Badge;
