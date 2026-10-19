'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export interface AdminToastContextValue {
  /** Trigger a success toast (auto-dismiss after 4000ms) */
  success: (message: string) => void;
  /** Trigger an error toast (auto-dismiss after 6000ms) */
  error: (message: string) => void;
  /** Trigger an informational toast (auto-dismiss after 4000ms) */
  info: (message: string) => void;
  /** Dismiss a toast by id (or the oldest/active if omitted) */
  dismiss: (id?: number) => void;
}

export interface AdminToastProviderProps {
  children: React.ReactNode;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

let toastCounter = 0;

/**
 * AdminToastProvider: Provides a lightweight, non-blocking toast notification system for admin pages.
 * Supports up to 3 concurrent toasts, positioned safely above modals with mobile bottom-nav offset support.
 */
export function AdminToastProvider({ children }: AdminToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const dismiss = useCallback((id?: number) => {
    setToasts((prev) => {
      if (id === undefined) {
        const target = prev[prev.length - 1];
        if (!target) return prev;
        const timer = timersRef.current.get(target.id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(target.id);
        }
        return prev.slice(0, -1);
      }

      const timer = timersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++toastCounter;
      const duration = type === 'error' ? 6000 : 4000;

      setToasts((prev) => {
        const next = [...prev, { id, type, message }];
        if (next.length > 3) {
          const dropped = next.slice(0, next.length - 3);
          for (const item of dropped) {
            const timer = timersRef.current.get(item.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(item.id);
            }
          }
          return next.slice(-3);
        }
        return next;
      });

      const timer = setTimeout(() => {
        dismiss(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const success = useCallback((message: string) => addToast('success', message), [addToast]);
  const error = useCallback((message: string) => addToast('error', message), [addToast]);
  const info = useCallback((message: string) => addToast('info', message), [addToast]);

  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  return (
    <AdminToastContext.Provider value={{ success, error, info, dismiss }}>
      {children}
      <div
        className="fixed right-4 z-[110] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--admin-bottom-nav-height, 0px) + 1rem)',
        }}
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? undefined : 'polite'}
              onClick={() => dismiss(toast.id)}
              className={cn(
                'pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer transition-all',
                toast.type === 'success' && 'bg-green-500 text-white',
                toast.type === 'error' && 'bg-red-500 text-white',
                toast.type === 'info' && 'bg-blue-600 text-white'
              )}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}

              <span className="text-sm font-medium flex-1 break-words">{toast.message}</span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(toast.id);
                }}
                className="p-1 rounded-md hover:bg-white/20 transition-colors text-white/80 hover:text-white shrink-0"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AdminToastContext.Provider>
  );
}

/**
 * useAdminToast: Hook to consume the admin toast notification context.
 * Throws an error if used outside AdminToastProvider.
 */
export function useAdminToast(): AdminToastContextValue {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error('useAdminToast must be used within an AdminToastProvider');
  }
  return context;
}
