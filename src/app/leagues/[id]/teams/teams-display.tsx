"use client";

import React from "react";
import { Nav } from "@/components/nav";
import { LeagueNav } from "@/components/league-nav";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { System } from "@prisma/client";

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface Player {
  playerSeason: {
    player: {
      id: string;
      name: string;
      gamertags: {
        gamertag: string;
        system: System;
      }[];
    };
    position: string;
    contract: {
      amount: number;
    } | null;
  };
  plusMinus: number;
  goalsAgainst: number | null;
  saves: number | null;
}

interface TeamSeason {
  team: {
    id: string;
    officialName: string;
    teamIdentifier: string;
  };
  wins: number;
  losses: number;
  otLosses: number;
  players: Player[];
}

interface TeamsDisplayProps {
  league: League;
  teams: TeamSeason[];
}

export function TeamsDisplay({ league, teams }: TeamsDisplayProps) {
  // Sort teams alphabetically by name
  const sortedTeams = [...teams].sort((a, b) => 
    a.team.officialName.localeCompare(b.team.officialName)
  );

  const [isMobile, setIsMobile] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getPositionPlayers = (players: Player[], positions: string[]) => {
    return players
      .filter(p => positions.includes(p.playerSeason.position))
      .sort((a, b) => a.playerSeason.player.name.localeCompare(b.playerSeason.player.name));
  };

  const scrollToTeam = (teamId: string) => {
    const element = document.getElementById(teamId);
    if (element) {
      const navHeight = 64; // Main nav height
      const leagueNavHeight = 48; // League nav height
      const teamNavHeight = 48; // Team nav height
      const padding = isMobile ? 80 : -40; // More padding on mobile, negative on desktop
      const totalOffset = navHeight + leagueNavHeight + teamNavHeight + padding;
      
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - totalOffset,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Nav />

      {/* League Banner */}
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image
              src={league.logo}
              alt={`${league.name} Logo`}
              width={80}
              height={80}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-white">{league.name} Teams</h1>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Team Abbreviation Navigation */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {sortedTeams.map((team) => (
              <button
                key={team.team.id}
                onClick={() => scrollToTeam(team.team.id)}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 hover:opacity-75 transition-all"
              >
                {team.team.teamIdentifier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedTeams.map((teamSeason) => (
            <Card 
              key={teamSeason.team.id} 
              id={teamSeason.team.id}
              className="card-gradient card-hover overflow-hidden"
            >
              <CardHeader className="border-b border-border">
                <CardTitle className="flex flex-col">
                  <Link 
                    href={`/leagues/${league.id}/teams/${teamSeason.team.teamIdentifier}`}
                    className="text-2xl hover:opacity-75"
                  >
                    {teamSeason.team.officialName}
                  </Link>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-400">${teamSeason.players.reduce((total, player) => total + (player.playerSeason.contract?.amount || 500000), 0).toLocaleString()}</span>
                    <span className="text-lg font-mono bg-secondary/50 px-3 py-1 rounded-md">
                      {teamSeason.wins}-{teamSeason.losses}-{teamSeason.otLosses}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Forwards */}
                <div className="border-b border-border">
                  <div className="p-4 bg-secondary/30">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Forwards</h3>
                      {(() => {
                        const forwardCount = getPositionPlayers(teamSeason.players, ["LW", "C", "RW"]).length;
                        let countColor = 'text-red-500';
                        if (forwardCount >= 9) countColor = 'text-green-500';
                        else if (forwardCount >= 6) countColor = 'text-yellow-500';
                        return <span className={`${countColor} font-medium`}>{forwardCount} players</span>;
                      })()}
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Left Wings */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Left Wing</h4>
                        {(() => {
                          const lwCount = getPositionPlayers(teamSeason.players, ["LW"]).length;
                          let countColor = 'text-red-500';
                          if (lwCount >= 3) countColor = 'text-green-500';
                          else if (lwCount === 2) countColor = 'text-yellow-500';
                          return <span className={`${countColor} text-sm font-medium`}>{lwCount}</span>;
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ["LW"]).map((player) => (
                          <div key={player.playerSeason.player.id} className="mb-2 flex justify-between items-center last:mb-0">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/users/${player.playerSeason.player.id}`}
                                className="hover:text-blue-400"
                              >
                                {player.playerSeason.player.gamertags[0]?.gamertag || player.playerSeason.player.name}
                              </Link>
                              <span className="text-xs text-gray-400">${(player.playerSeason.contract?.amount || 500000).toLocaleString()}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Centers */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Center</h4>
                        {(() => {
                          const cCount = getPositionPlayers(teamSeason.players, ["C"]).length;
                          let countColor = 'text-red-500';
                          if (cCount >= 3) countColor = 'text-green-500';
                          else if (cCount === 2) countColor = 'text-yellow-500';
                          return <span className={`${countColor} text-sm font-medium`}>{cCount}</span>;
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ["C"]).map((player) => (
                          <div key={player.playerSeason.player.id} className="mb-2 flex justify-between items-center last:mb-0">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/users/${player.playerSeason.player.id}`}
                                className="hover:text-blue-400"
                              >
                                {player.playerSeason.player.gamertags[0]?.gamertag || player.playerSeason.player.name}
                              </Link>
                              <span className="text-xs text-gray-400">${(player.playerSeason.contract?.amount || 500000).toLocaleString()}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Right Wings */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Right Wing</h4>
                        {(() => {
                          const rwCount = getPositionPlayers(teamSeason.players, ["RW"]).length;
                          let countColor = 'text-red-500';
                          if (rwCount >= 3) countColor = 'text-green-500';
                          else if (rwCount === 2) countColor = 'text-yellow-500';
                          return <span className={`${countColor} text-sm font-medium`}>{rwCount}</span>;
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ["RW"]).map((player) => (
                          <div key={player.playerSeason.player.id} className="mb-2 flex justify-between items-center last:mb-0">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/users/${player.playerSeason.player.id}`}
                                className="hover:text-blue-400"
                              >
                                {player.playerSeason.player.gamertags[0]?.gamertag || player.playerSeason.player.name}
                              </Link>
                              <span className="text-xs text-gray-400">${(player.playerSeason.contract?.amount || 500000).toLocaleString()}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Defense */}
                <div className="border-b border-border">
                  <div className="p-4 bg-secondary/30">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Defense</h3>
                      {(() => {
                        const defenseCount = getPositionPlayers(teamSeason.players, ["LD", "RD"]).length;
                        let countColor = 'text-red-500';
                        if (defenseCount >= 6) countColor = 'text-green-500';
                        else if (defenseCount >= 4) countColor = 'text-yellow-500';
                        return <span className={`${countColor} font-medium`}>{defenseCount} players</span>;
                      })()}
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Left Defense */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Left Defense</h4>
                        {(() => {
                          const ldCount = getPositionPlayers(teamSeason.players, ["LD"]).length;
                          let countColor = 'text-yellow-500';
                          if (ldCount >= 3) countColor = 'text-green-500';
                          return <span className={`${countColor} text-sm font-medium`}>{ldCount}</span>;
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ["LD"]).map((player) => (
                          <div key={player.playerSeason.player.id} className="mb-2 flex justify-between items-center last:mb-0">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/users/${player.playerSeason.player.id}`}
                                className="hover:text-blue-400"
                              >
                                {player.playerSeason.player.gamertags[0]?.gamertag || player.playerSeason.player.name}
                              </Link>
                              <span className="text-xs text-gray-400">${(player.playerSeason.contract?.amount || 500000).toLocaleString()}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Right Defense */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Right Defense</h4>
                        {(() => {
                          const rdCount = getPositionPlayers(teamSeason.players, ["RD"]).length;
                          let countColor = 'text-yellow-500';
                          if (rdCount >= 3) countColor = 'text-green-500';
                          return <span className={`${countColor} text-sm font-medium`}>{rdCount}</span>;
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ["RD"]).map((player) => (
                          <div key={player.playerSeason.player.id} className="mb-2 flex justify-between items-center last:mb-0">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/users/${player.playerSeason.player.id}`}
                                className="hover:text-blue-400"
                              >
                                {player.playerSeason.player.gamertags[0]?.gamertag || player.playerSeason.player.name}
                              </Link>
                              <span className="text-xs text-gray-400">${(player.playerSeason.contract?.amount || 500000).toLocaleString()}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goalies */}
                <div>
                  <div className="p-4 bg-secondary/30">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Goalies</h3>
                      {(() => {
                        const goalieCount = getPositionPlayers(teamSeason.players, ["G"]).length;
                        let countColor = 'text-red-500';
                        if (goalieCount >= 2) countColor = 'text-green-500';
                        else if (goalieCount === 1) countColor = 'text-yellow-500';
                        return <span className={`${countColor} font-medium`}>{goalieCount} players</span>;
                      })()}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Goalies</h4>
                        {(() => {
                          const gCount = getPositionPlayers(teamSeason.players, ["G"]).length;
                          let countColor = 'text-yellow-500';
                          if (gCount >= 2) countColor = 'text-green-500';
                          return <span className={`${countColor} text-sm font-medium`}>{gCount}</span>;
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ["G"]).map((player) => {
                          const saves = player.saves ?? 0;
                          const goalsAgainst = player.goalsAgainst ?? 0;
                          const totalShots = saves + goalsAgainst;
                          const savePercentage = totalShots > 0 ? saves / totalShots : 0;
                          
                          let savePercentageColor = 'text-red-500 bg-red-500/20';
                          if (savePercentage >= 0.8) {
                            savePercentageColor = 'text-green-500 bg-green-500/20';
                          } else if (savePercentage >= 0.7) {
                            savePercentageColor = 'text-yellow-500 bg-yellow-500/20';
                          }

                          return (
                            <div key={player.playerSeason.player.id} className="mb-2 flex justify-between items-center last:mb-0">
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/users/${player.playerSeason.player.id}`}
                                  className="hover:text-blue-400"
                                >
                                  {player.playerSeason.player.gamertags[0]?.gamertag || player.playerSeason.player.name}
                                </Link>
                                <span className="text-xs text-gray-400">${(player.playerSeason.contract?.amount || 500000).toLocaleString()}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-sm ${savePercentageColor}`}>
                                {totalShots === 0 ? '0.0%' : `${(savePercentage * 100).toFixed(1)}%`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Back to top"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
} 