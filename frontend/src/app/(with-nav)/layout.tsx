import { Nav } from '@/components/nav';
import { NotificationsProvider } from '@/providers/notifications-provider';
import { auth } from '../../../auth';

export default async function WithNavLayout({ children }: { children: React.ReactNode }) {
  // Check if user is authenticated
  const session = await auth();
  const isAuthenticated = !!session;

  return (
    <>
      {isAuthenticated ? (
        <NotificationsProvider>
          <Nav />
          {children}
        </NotificationsProvider>
      ) : (
        <>
          <Nav />
          {children}
        </>
      )}
    </>
  );
}
