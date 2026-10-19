import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Tone variants supported by AdminBadge.
 */
export type BadgeTone =
  | 'success'
  | 'warning'
  | 'neutral'
  | 'danger'
  | 'info'
  | 'purple'
  | 'gold';

export interface AdminBadgeProps {
  /** Visual tone of the badge determining background and text colors */
  tone?: BadgeTone;
  /** Content of the badge (text, icon, or counter) */
  children: React.ReactNode;
  /** Optional custom CSS classes */
  className?: string;
}

const toneStyles: Record<BadgeTone, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  neutral: 'bg-slate-100 text-slate-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  gold: 'bg-gold-500/10 text-gold-600',
};

/**
 * AdminBadge: Reusable status and role pill badge for admin interfaces.
 * Provides consistent rounded-full styling across status states and roles.
 */
export function AdminBadge({
  tone = 'neutral',
  children,
  className,
}: AdminBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
