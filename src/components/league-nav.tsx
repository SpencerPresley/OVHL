"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

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
    { href: `/leagues/${leagueId}`, label: "Overview" },
    { href: `/leagues/${leagueId}/standings`, label: "Standings" },
    { href: `/leagues/${leagueId}/teams`, label: "Teams" },
    { href: `/leagues/${leagueId}/schedule`, label: "Schedule" },
    { href: `/leagues/${leagueId}/stats`, label: "Stats" },
  ];

  return (
    <div className="border-b border-white/10">
      <div className="container mx-auto px-4">
        <nav className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "py-4 text-sm font-medium transition-colors hover:text-blue-400",
                pathname === link.href
                  ? "border-b-2 border-blue-400 text-blue-400"
                  : "text-gray-300",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
