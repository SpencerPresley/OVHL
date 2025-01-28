import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GET } from "@/app/api/leagues/[id]/standings/route";

// Types for standings response
interface TeamStats {
  teamId: string;
  teamName: string;
  teamIdentifier: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  powerplayGoals: number;
  powerplayOpportunities: number;
  powerplayPercentage: number;
  penaltyKillGoalsAgainst: number;
  penaltyKillOpportunities: number;
  penaltyKillPercentage: number;
}

interface DivisionStandings {
  division: string;
  teams: TeamStats[];
}

interface StandingsResponse {
  standings: DivisionStandings[];
}

// Mock team data
jest.mock("@/lib/teams/nhl", () => ({
  NHL_TEAMS: [
    { id: "TOR", division: "Atlantic" },
    { id: "MTL", division: "Atlantic" },
    { id: "BOS", division: "Atlantic" },
  ],
}));

jest.mock("@/lib/teams/ahl", () => ({
  AHL_TEAMS: [],
}));

jest.mock("@/lib/teams/echl", () => ({
  ECHL_TEAMS: [],
}));

jest.mock("@/lib/teams/chl", () => ({
  CHL_TEAMS: [],
}));

// Mock dependencies
jest.mock("@prisma/client", () => {
  const mockFindFirst = jest.fn();
  const mockFindMany = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      season: {
        findFirst: mockFindFirst,
      },
      tier: {
        findFirst: mockFindFirst,
      },
      teamSeason: {
        findMany: mockFindMany,
      },
    })),
    __mockFindFirst: mockFindFirst,
    __mockFindMany: mockFindMany,
  };
});

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => ({
      ...body,
      status: init?.status,
    })),
  },
}));

describe("Standings API Route", () => {
  const mockSeason = {
    id: "season1",
    isLatest: true,
  };

  const mockTier = {
    id: "tier1",
    seasonId: "season1",
    leagueLevel: 1,
  };

  const mockTeamSeasons = [
    {
      teamId: "team1",
      tierId: "tier1",
      matchesPlayed: 10,
      wins: 7,
      losses: 2,
      otLosses: 1,
      goalsFor: 35,
      goalsAgainst: 20,
      powerplayGoals: 8,
      powerplayOpportunities: 30,
      penaltyKillGoalsAgainst: 5,
      penaltyKillOpportunities: 25,
      team: {
        teamIdentifier: "TOR",
        officialName: "Toronto Maple Leafs",
      },
    },
    {
      teamId: "team2",
      tierId: "tier1",
      matchesPlayed: 10,
      wins: 6,
      losses: 3,
      otLosses: 1,
      goalsFor: 30,
      goalsAgainst: 25,
      powerplayGoals: 7,
      powerplayOpportunities: 28,
      penaltyKillGoalsAgainst: 6,
      penaltyKillOpportunities: 24,
      team: {
        teamIdentifier: "MTL",
        officialName: "Montreal Canadiens",
      },
    },
  ];

  let mockFindFirst: jest.Mock;
  let mockFindMany: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get reference to mocked functions
    mockFindFirst = require("@prisma/client").__mockFindFirst;
    mockFindMany = require("@prisma/client").__mockFindMany;
  });

  describe("League ID Validation", () => {
    it("returns 400 when league ID is invalid", async () => {
      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "invalid" }),
      });

      expect(response.status).toBe(400);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Invalid league ID",
        })
      );
    });

    it("accepts valid league IDs", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason)  // season.findFirst
        .mockResolvedValueOnce(mockTier);   // tier.findFirst
      mockFindMany.mockResolvedValueOnce(mockTeamSeasons);

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      });

      expect(response.status).toBeUndefined();
    });
  });

  describe("Season and Tier Lookup", () => {
    it("returns 404 when no active season is found", async () => {
      mockFindFirst.mockResolvedValueOnce(null); // No season found

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      });

      expect(response.status).toBe(404);
      expect(response).toEqual(
        expect.objectContaining({
          error: "No active season found",
        })
      );
    });

    it("returns 404 when no tier is found for the league", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason)  // season.findFirst
        .mockResolvedValueOnce(null);       // tier.findFirst

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      });

      expect(response.status).toBe(404);
      expect(response).toEqual(
        expect.objectContaining({
          error: "League tier not found",
        })
      );
    });
  });

  describe("Team Stats and Division Grouping", () => {
    it("correctly calculates team stats and groups by division", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason)  // season.findFirst
        .mockResolvedValueOnce(mockTier);   // tier.findFirst
      mockFindMany.mockResolvedValueOnce(mockTeamSeasons);

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      }) as NextResponse<StandingsResponse>;

      expect(response.status).toBeUndefined();
      
      const data = response as unknown as StandingsResponse;
      expect(data.standings).toBeDefined();
      expect(Array.isArray(data.standings)).toBe(true);

      // Check division grouping
      const atlanticDivision = data.standings.find((d: DivisionStandings) => d.division === "Atlantic");
      expect(atlanticDivision).toBeDefined();
      expect(atlanticDivision?.teams).toBeDefined();
      expect(Array.isArray(atlanticDivision?.teams)).toBe(true);
      expect(atlanticDivision?.teams.length).toBe(2); // Both TOR and MTL are in Atlantic

      // Check team stats calculation
      const torontoTeam = atlanticDivision?.teams.find((t: TeamStats) => t.teamIdentifier === "TOR");
      expect(torontoTeam).toBeDefined();
      expect(torontoTeam).toEqual(
        expect.objectContaining({
          points: 15, // 7 wins * 2 + 1 OT loss
          goalDifferential: 15, // 35 GF - 20 GA
          powerplayPercentage: (8 / 30) * 100,
          penaltyKillPercentage: ((25 - 5) / 25) * 100,
        })
      );
    });

    it("sorts teams by points and then by name", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason)  // season.findFirst
        .mockResolvedValueOnce(mockTier);   // tier.findFirst
      mockFindMany.mockResolvedValueOnce(mockTeamSeasons);

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      }) as NextResponse<StandingsResponse>;

      const data = response as unknown as StandingsResponse;
      const atlanticDivision = data.standings.find((d: DivisionStandings) => d.division === "Atlantic");
      expect(atlanticDivision).toBeDefined();
      const teams = atlanticDivision?.teams;

      // Toronto should be first (15 points)
      // Montreal should be second (13 points)
      expect(teams?.[0].teamIdentifier).toBe("TOR");
      expect(teams?.[1].teamIdentifier).toBe("MTL");
    });

    it("ignores teams with unknown divisions", async () => {
      const teamsWithUnknownDivision = [
        ...mockTeamSeasons,
        {
          teamId: "team3",
          tierId: "tier1",
          matchesPlayed: 10,
          wins: 8,
          losses: 2,
          otLosses: 0,
          goalsFor: 40,
          goalsAgainst: 20,
          powerplayGoals: 10,
          powerplayOpportunities: 30,
          penaltyKillGoalsAgainst: 4,
          penaltyKillOpportunities: 25,
          team: {
            teamIdentifier: "UNKNOWN",
            officialName: "Unknown Team",
          },
        },
      ];

      mockFindFirst
        .mockResolvedValueOnce(mockSeason)
        .mockResolvedValueOnce(mockTier);
      mockFindMany.mockResolvedValueOnce(teamsWithUnknownDivision);

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      }) as NextResponse<StandingsResponse>;

      const data = response as unknown as StandingsResponse;
      const allTeams = data.standings.flatMap(d => d.teams);
      expect(allTeams.length).toBe(2); // Should only include TOR and MTL
      expect(allTeams.find(t => t.teamIdentifier === "UNKNOWN")).toBeUndefined();
    });
  });

  describe("Error Handling", () => {
    it("returns 500 on database error", async () => {
      mockFindFirst.mockRejectedValueOnce(new Error("Database error"));

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      });

      expect(response.status).toBe(500);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Failed to fetch standings",
        })
      );
    });

    it("returns 500 on unexpected error", async () => {
      mockFindFirst
        .mockResolvedValueOnce(mockSeason)  // season.findFirst
        .mockResolvedValueOnce(mockTier);   // tier.findFirst
      mockFindMany.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ id: "nhl" }),
      });

      expect(response.status).toBe(500);
      expect(response).toEqual(
        expect.objectContaining({
          error: "Failed to fetch standings",
        })
      );
    });
  });
}); 