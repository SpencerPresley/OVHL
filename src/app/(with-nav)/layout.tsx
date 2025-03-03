import { Nav } from '@/components/nav';

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
} 