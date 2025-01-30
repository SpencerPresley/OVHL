import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | OVHL',
  description: 'Admin dashboard for managing OVHL teams and seasons',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
