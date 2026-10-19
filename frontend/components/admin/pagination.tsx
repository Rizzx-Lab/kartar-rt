'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminPaginationProps {
  /** The current active page (1-based index) */
  currentPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Callback triggered when a new page is selected */
  onPageChange: (page: number) => void;
  /** Optional custom CSS classes for the container */
  className?: string;
}

/**
 * AdminPagination: Standard pagination control for tables and list views.
 * Returns null if totalPages <= 1.
 * Features 44px minimum touch targets on mobile (h-11 w-11) and compact size on desktop (sm:h-9 sm:w-9).
 */
export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 pt-6',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Halaman sebelumnya"
        className="inline-flex items-center justify-center h-11 w-11 sm:h-9 sm:w-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors shrink-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <span className="text-sm font-medium text-gray-600 select-none">
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Halaman berikutnya"
        className="inline-flex items-center justify-center h-11 w-11 sm:h-9 sm:w-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors shrink-0"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
