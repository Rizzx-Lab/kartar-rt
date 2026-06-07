'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

export function LayoutController({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAdmin(window.location.pathname.startsWith('/admin'));
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return null;
  }

  // Admin pages have their own layout in admin/layout.tsx
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}