'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for debugging
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-navy-900 mb-2">
            Terjadi Kesalahan
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {error.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
          </p>

          {/* Stack trace for debugging */}
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="text-left mb-6">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Detail error (development only)
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 text-red-400 text-xs rounded-lg overflow-x-auto whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}

          {/* Digest ID if present */}
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4">
              Error ID: <code className="bg-gray-100 px-1 rounded">{error.digest}</code>
            </p>
          )}

          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold rounded-xl transition-colors"
          >
            Coba Lagi
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Jika masalah terus terjadi, silakan hubungi administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
