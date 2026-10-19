'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

/** A single route tab entry for the bottom navigation bar. */
export interface BottomNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface BottomNavProps {
  /** The four route tab entries. Each must have an `href`, `label`, and `icon`. */
  items: BottomNavItem[];
  /** Callback invoked when the "Menu" tab button is pressed to open the drawer. */
  onOpenMenu: () => void;
  /** When true, renders a small gold dot on the Kontak (contacts) tab. */
  showContactsDot?: boolean;
}

/**
 * BottomNav — fixed mobile bottom navigation bar (hidden on md and up).
 *
 * Renders 4 route link tabs plus a "Menu" button that opens the full drawer.
 * Active state is detected by comparing `usePathname()` against each `href`.
 * The bar height is 4rem (h-16) with additional padding for safe-area-inset-bottom.
 *
 * @example
 * ```tsx
 * <BottomNav
 *   items={routeItems}
 *   onOpenMenu={() => setIsMobileOpen(true)}
 *   showContactsDot={notifications.length > 0}
 * />
 * ```
 */
export function BottomNav({ items, onOpenMenu, showContactsDot = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        'md:hidden fixed bottom-0 inset-x-0 z-30',
        'bg-white border-t border-gray-200',
        'h-16',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href + '/') === true);
          // Check if this is the contacts tab (by href) to conditionally show dot
          const isContacts = item.href === '/admin/contacts';

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                'min-h-[44px] min-w-[44px] px-1 transition-colors',
                isActive ? 'text-navy-800' : 'text-gray-500 hover:text-navy-800',
              )}
            >
              {/* Active indicator pill behind icon */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-2 rounded-full w-10 h-7 bg-gold-500/15"
                />
              )}

              <span className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6',
                    isActive ? 'text-navy-800' : 'text-gray-400',
                  )}
                />
                {/* Contacts unread dot */}
                {isContacts && showContactsDot && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold-500 rounded-full ring-2 ring-white"
                  />
                )}
              </span>

              <span
                className={cn(
                  'text-[11px] leading-none font-medium',
                  isActive ? 'text-navy-800' : 'text-gray-500',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu tab — opens the full drawer */}
        <button
          type="button"
          aria-label="Buka menu lengkap"
          onClick={onOpenMenu}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5',
            'min-h-[44px] min-w-[44px] px-1 transition-colors',
            'text-gray-500 hover:text-navy-800',
          )}
        >
          <Menu className="w-6 h-6 text-gray-400" />
          <span className="text-[11px] leading-none font-medium text-gray-500">Menu</span>
        </button>
      </div>
    </nav>
  );
}
