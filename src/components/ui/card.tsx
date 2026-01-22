'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type CardVariant = 'default' | 'glass' | 'gradient' | 'elevated' | 'outline' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';
type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  hover?: boolean;
  glow?: boolean;
  gradient?: 'amber' | 'indigo' | 'emerald' | 'pink' | 'slate' | 'none';
  as?: 'div' | 'article' | 'section';
  children?: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white border border-slate-200 shadow-sm',
  glass:
    'bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl',
  gradient:
    'bg-gradient-to-br border border-slate-100 shadow-sm',
  elevated:
    'bg-white border border-slate-100 shadow-xl shadow-slate-200/50',
  outline:
    'bg-transparent border-2 border-slate-200',
  interactive:
    'bg-white border border-slate-200 shadow-sm cursor-pointer',
};

const hoverStyles: Record<CardVariant, string> = {
  default:
    'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5',
  glass:
    'hover:bg-white/70 hover:shadow-2xl hover:-translate-y-0.5',
  gradient:
    'hover:shadow-lg hover:-translate-y-1',
  elevated:
    'hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1',
  outline:
    'hover:border-slate-300 hover:bg-slate-50/50',
  interactive:
    'hover:shadow-lg hover:border-amber-200 hover:-translate-y-1 hover:bg-amber-50/30 active:translate-y-0 active:shadow-md',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const radiusStyles: Record<CardRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-[20px]',
  '2xl': 'rounded-[24px]',
  '3xl': 'rounded-[32px]',
};

const gradientStyles: Record<NonNullable<CardProps['gradient']>, string> = {
  amber: 'from-amber-50 via-white to-slate-50',
  indigo: 'from-indigo-50 via-white to-slate-50',
  emerald: 'from-emerald-50 via-white to-slate-50',
  pink: 'from-pink-50 via-white to-slate-50',
  slate: 'from-slate-50 via-white to-slate-50',
  none: '',
};

const glowStyles: Record<NonNullable<CardProps['gradient']>, string> = {
  amber: 'shadow-amber-200/50',
  indigo: 'shadow-indigo-200/50',
  emerald: 'shadow-emerald-200/50',
  pink: 'shadow-pink-200/50',
  slate: 'shadow-slate-200/50',
  none: '',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      radius = 'lg',
      hover = false,
      glow = false,
      gradient = 'none',
      as: Component = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={twMerge(
          clsx(
            // Base styles
            'relative flex flex-col transition-all duration-300 ease-out',
            // Variant styles
            variantStyles[variant],
            // Padding styles
            paddingStyles[padding],
            // Radius styles
            radiusStyles[radius],
            // Gradient for gradient variant
            variant === 'gradient' && gradientStyles[gradient],
            // Hover effects
            hover && hoverStyles[variant],
            // Glow effect
            glow && 'shadow-lg',
            glow && glowStyles[gradient],
            // Custom className
            className
          )
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, icon, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex items-start justify-between gap-4',
            className
          )
        )}
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              {icon}
            </div>
          )}
          <div className="flex flex-col">
            {title && (
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
            {children}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content Component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(clsx('flex-1', className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  separator?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ separator = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex items-center gap-3 mt-auto pt-4',
            separator && 'border-t border-slate-200',
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

CardFooter.displayName = 'CardFooter';

// Stat Card - Special variant for displaying statistics
interface StatCardProps extends Omit<CardProps, 'children'> {
  label: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon?: ReactNode;
  trend?: ReactNode;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, change, icon, trend, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="default"
        hover
        className={twMerge(clsx('gap-3', className))}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          {icon && (
            <span className="text-slate-400">{icon}</span>
          )}
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="text-3xl font-bold text-slate-900">{value}</span>
          {change && (
            <span
              className={clsx(
                'text-xs font-semibold px-2 py-1 rounded-full',
                change.positive
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              )}
            >
              {change.positive ? '↑' : '↓'} {change.value}
            </span>
          )}
        </div>
        {trend && <div className="mt-2">{trend}</div>}
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export default Card;
