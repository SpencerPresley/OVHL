// NHL Division Enums
export enum NHLConference {
  EASTERN = 'Eastern',
  WESTERN = 'Western',
}

export enum NHLDivision {
  ATLANTIC = 'Atlantic',
  METROPOLITAN = 'Metropolitan',
  CENTRAL = 'Central',
  PACIFIC = 'Pacific',
}

// AHL Division Enums
export enum AHLDivision {
  ATLANTIC = 'Atlantic',
  NORTH = 'North',
  CENTRAL = 'Central',
  PACIFIC = 'Pacific',
}

// ECHL Division Enums
export enum ECHLDivision {
  NORTH = 'Eastern North',
  SOUTH = 'Eastern South',
  CENTRAL = 'Western Central',
  MOUNTAIN = 'Western Mountain',
}

// CHL League and Division Enums
export enum CHLLeague {
  NAJHL = 'NAJHL',
  OHL = 'OHL',
  QMJHL = 'QMJHL',
  WHL = 'WHL',
}

export enum NAJHLDivision {
  EAST = 'East',
  WEST = 'West',
}

export enum OHLDivision {
  NORTH = 'North',
  SOUTH = 'South',
}

export enum QMJHLDivision {
  NORTH = 'North',
  SOUTH = 'South',
}

export enum WHLDivision {
  EAST = 'East',
  WEST = 'West',
}

// Team Interfaces
export interface NHLTeam {
  id: string;
  name: string;
  conference: NHLConference;
  division: NHLDivision;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface AHLTeam {
  id: string;
  name: string;
  division: AHLDivision;
  nhlTeamId: string | null; // null for independent teams
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface ECHLTeam {
  id: string;
  name: string;
  division: ECHLDivision;
  nhlTeamId: string;
  ahlTeamId: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface CHLTeam {
  id: string;
  name: string;
  league: CHLLeague;
  division: NAJHLDivision | OHLDivision | QMJHLDivision | WHLDivision;
  colors: {
    primary: string;
    secondary: string;
  };
}
