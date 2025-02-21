'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface LeagueNavProps {
  leagueId: string;
}

/**
 * League Navigation Component
 *
 * Secondary navigation bar for league-specific pages.
 * Features:
 * - Links to league overview, standings, teams, etc.
 * - Active state indication
 * - Consistent styling with main navigation
 *
 * @component
 * @param {LeagueNavProps} props - Component props
 * @returns {JSX.Element} Rendered league navigation
 */
export function LeagueNav({ leagueId }: LeagueNavProps) {
  const pathname = usePathname();

  const links = [
    { href: `/leagues/${leagueId}`, label: 'Overview' },
    { href: `/leagues/${leagueId}/standings`, label: 'Standings' },
    { href: `/leagues/${leagueId}/teams`, label: 'Teams' },
    { href: `/leagues/${leagueId}/schedule`, label: 'Schedule' },
    { href: `/leagues/${leagueId}/stats`, label: 'Stats' },
    { href: `/leagues/${leagueId}/bidding`, label: 'Bidding' },
    { href: `/leagues/${leagueId}/forum`, label: 'Forum' },
  ];

  return (
    <div className="border-b border-white/10">
      <ScrollArea className="w-full">
        <div className="container mx-auto px-2 md:px-4">
          <nav className="flex whitespace-nowrap">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'py-3 md:py-4 px-2 md:px-3 text-sm font-medium transition-colors hover:text-blue-400',
                  pathname === link.href
                    ? 'border-b-2 border-blue-400 text-blue-400'
                    : 'text-gray-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
