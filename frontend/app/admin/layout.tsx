import type { Metadata } from 'next';
import AdminLayoutClient from './admin-layout-client';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  themeColor: '#C9A84C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}