import { Nav } from '@/components/nav';
import { NotificationsProvider } from '@/providers/notifications-provider';

export default function WithNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NotificationsProvider>
        <Nav />
        {children}
      </NotificationsProvider>
    </>
  );
}
