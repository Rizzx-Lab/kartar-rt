import React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminEmptyStateProps {
  /** Optional icon component or ReactNode. Defaults to Inbox from lucide-react inside a soft circle */
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
  /** Primary title or headline of the empty state */
  title: React.ReactNode;
  /** Optional secondary text providing further explanation */
  description?: React.ReactNode;
  /** Optional action slot (e.g. CTA button to create a record) */
  action?: React.ReactNode;
  /** Optional custom CSS classes for the container */
  className?: string;
}

/**
 * AdminEmptyState: Standard empty state display for tables, lists, and grids.
 * Features a centered soft circle icon, title, optional description, and action button.
 */
export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  const renderIcon = () => {
    if (!icon) {
      return <Inbox className="w-8 h-8 text-navy-700" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-8 h-8 text-navy-700" />;
    }
    return icon;
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-8 sm:p-12 text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center text-navy-700 mb-4 shrink-0">
        {renderIcon()}
      </div>
      <h3 className="text-base font-semibold text-navy-900">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1.5 max-w-md">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
