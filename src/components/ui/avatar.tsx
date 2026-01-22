'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { User } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarVariant = 'circle' | 'rounded' | 'square';
type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  status?: AvatarStatus;
  showStatus?: boolean;
  fallback?: ReactNode;
  bordered?: boolean;
  gradient?: boolean;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const iconSizes: Record<AvatarSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

const variantStyles: Record<AvatarVariant, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-xl',
  square: 'rounded-lg',
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-[3px]',
};

const statusPositions: Record<AvatarVariant, string> = {
  circle: 'bottom-0 right-0',
  rounded: 'bottom-0 right-0 translate-x-0.5 translate-y-0.5',
  square: '-bottom-0.5 -right-0.5',
};

// Generate initials from name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Generate consistent color based on name
const getColorFromName = (name: string): string => {
  const colors = [
    'from-amber-400 to-orange-500',
    'from-indigo-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-indigo-500',
    'from-red-400 to-orange-500',
    'from-green-400 to-emerald-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      variant = 'circle',
      status,
      showStatus = false,
      fallback,
      bordered = false,
      gradient = true,
      className,
      ...props
    },
    ref
  ) => {
    const displayAlt = alt || name || 'Avatar';
    const hasImage = !!src;
    const initials = name ? getInitials(name) : null;
    const colorGradient = name ? getColorFromName(name) : 'from-slate-400 to-slate-500';

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'relative inline-flex items-center justify-center flex-shrink-0',
            'font-semibold select-none',
            sizeStyles[size],
            variantStyles[variant],
            // Background for non-image avatars
            !hasImage && gradient && `bg-gradient-to-br ${colorGradient} text-white`,
            !hasImage && !gradient && 'bg-slate-200 text-slate-600',
            // Border
            bordered && 'ring-2 ring-white shadow-md',
            // Overflow
            'overflow-hidden',
            className
          )
        )}
        {...props}
      >
        {/* Image */}
        {hasImage ? (
          <img
            src={src}
            alt={displayAlt}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error to show fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : fallback ? (
          // Custom Fallback
          fallback
        ) : initials ? (
          // Initials
          <span className="leading-none">{initials}</span>
        ) : (
          // Default Icon
          <User className={iconSizes[size]} />
        )}

        {/* Status Indicator */}
        {showStatus && status && (
          <span
            className={clsx(
              'absolute rounded-full border-white',
              statusColors[status],
              statusSizes[size],
              statusPositions[variant]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
  variant?: AvatarVariant;
  spacing?: 'tight' | 'normal' | 'loose';
  children: ReactNode;
}

const spacingStyles: Record<NonNullable<AvatarGroupProps['spacing']>, string> = {
  tight: '-space-x-3',
  normal: '-space-x-2',
  loose: '-space-x-1',
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      max,
      size = 'md',
      variant = 'circle',
      spacing = 'normal',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const childArray = Array.isArray(children) ? children : [children];
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = max ? childArray.length - max : 0;

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'flex items-center',
            spacingStyles[spacing],
            className
          )
        )}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="ring-2 ring-white rounded-full"
            style={{ zIndex: visibleChildren.length - index }}
          >
            {child}
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className={clsx(
              'ring-2 ring-white',
              variantStyles[variant]
            )}
            style={{ zIndex: 0 }}
          >
            <Avatar
              size={size}
              variant={variant}
              gradient={false}
              name={`+${remainingCount}`}
              className="bg-slate-200 text-slate-600"
            />
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

// Avatar with Badge Component
interface AvatarWithBadgeProps extends AvatarProps {
  badge?: ReactNode;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const badgePositionStyles: Record<NonNullable<AvatarWithBadgeProps['badgePosition']>, string> = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
};

export const AvatarWithBadge = forwardRef<HTMLDivElement, AvatarWithBadgeProps>(
  ({ badge, badgePosition = 'bottom-right', className, ...avatarProps }, ref) => {
    return (
      <div ref={ref} className={clsx('relative inline-flex', className)}>
        <Avatar {...avatarProps} />
        {badge && (
          <span
            className={clsx(
              'absolute',
              badgePositionStyles[badgePosition]
            )}
          >
            {badge}
          </span>
        )}
      </div>
    );
  }
);

AvatarWithBadge.displayName = 'AvatarWithBadge';

export default Avatar;
