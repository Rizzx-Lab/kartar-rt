import React from 'react';
import { cn } from '@/lib/utils';

export interface AdminPageHeaderProps {
  /** The primary page title */
  title: React.ReactNode;
  /** Optional subtitle or description displayed below the title */
  subtitle?: React.ReactNode;
  /** Optional action slot (e.g. primary CTA button, search, or status pill) */
  action?: React.ReactNode;
  /** Optional custom CSS classes for the header container */
  className?: string;
}

/**
 * AdminPageHeader: Reusable top header for admin pages.
 * Stacks vertically on mobile and aligns horizontally on desktop (sm breakpoint and up).
 */
export function AdminPageHeader({
  title,
  subtitle,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-navy-800">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
