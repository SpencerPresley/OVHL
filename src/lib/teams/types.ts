// NHL Division Enums
export enum NHLConference {
  EASTERN = "Eastern",
  WESTERN = "Western"
}

export enum NHLDivision {
  ATLANTIC = "Atlantic",
  METROPOLITAN = "Metropolitan",
  CENTRAL = "Central",
  PACIFIC = "Pacific"
}

// AHL Division Enums
export enum AHLDivision {
  ATLANTIC = "Atlantic",
  NORTH = "North",
  CENTRAL = "Central",
  PACIFIC = "Pacific"
}

// ECHL Division Enums
export enum ECHLDivision {
  NORTH = "North",
  SOUTH = "South",
  CENTRAL = "Central",
  MOUNTAIN = "Mountain"
}

// CHL League and Division Enums
export enum CHLLeague {
  OHL = "OHL",
  QMJHL = "QMJHL",
  WHL = "WHL"
}

export enum OHLDivision {
  EAST = "East",
  CENTRAL = "Central",
  MIDWEST = "Midwest",
  WEST = "West"
}

export enum QMJHLDivision {
  EAST = "East",
  CENTRAL = "Central",
  WEST = "West"
}

export enum WHLDivision {
  EAST = "East",
  CENTRAL = "Central",
  BC = "B.C.",
  US = "U.S."
}

// Team Interfaces
export interface NHLTeam {
  id: string;
  name: string;
  conference: NHLConference;
  division: NHLDivision;
}

export interface AHLTeam {
  id: string;
  name: string;
  division: AHLDivision;
  nhlTeamId: string | null; // null for independent teams
}

export interface ECHLTeam {
  id: string;
  name: string;
  division: ECHLDivision;
  nhlTeamId: string;
  ahlTeamId: string;
}

export interface CHLTeam {
  id: string;
  name: string;
  league: CHLLeague;
  division: OHLDivision | QMJHLDivision | WHLDivision;
} 