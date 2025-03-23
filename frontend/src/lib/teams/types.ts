// NHL Division Enums
export enum NHLConference {
  EASTERN = 'Eastern',
  WESTERN = 'Western',
}

export enum AHLConference {
  EASTERN = 'Eastern',
  WESTERN = 'Western',
}

export enum ECHLConference {
  EASTERN = 'Eastern',
  WESTERN = 'Western',
}

export enum WHLConference {
  EASTERN = 'Eastern',
  WESTERN = 'Western',
}

export enum OHLConference {
  EASTERN = 'Eastern',
  WESTERN = 'Western',
}

export enum QMJHLConference {
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
  OHL = 'OHL',
  QMJHL = 'QMJHL',
  WHL = 'WHL',
}

export enum OHLDivision {
  EAST = 'East',
  CENTRAL = 'Central',
  MIDWEST = 'Midwest',
  WEST = 'West',
}

export enum QMJHLDivision {
  WEST = 'West',
  CENTRAL = 'Central',
  EAST = 'East',
  MARITIMES = 'Maritimes',
}

export enum WHLDivision {
  EAST = 'East',
  CENTRAL = 'Central',
  BC = 'B.C.',
  US = 'U.S.',
}

// Team Interfaces
export interface NHLTeam {
  id: string;
  name: string;
  abbreviation: string;
  conference: NHLConference;
  division: NHLDivision;
  colors: {
    primary: string;
    secondary: string;
  };
  logo_path: string;
  ahlTeamId: string;
  echlTeamId: string;
}

export interface AHLTeam {
  id: string;
  name: string;
  abbreviation: string;
  conference: AHLConference;
  division: AHLDivision;
  nhlTeamId: string;
  echlTeamId: string;
  colors: {
    primary: string;
    secondary: string;
  };
  logo_path: string;
}

export interface ECHLTeam {
  id: string;
  name: string;
  abbreviation: string;
  conference: ECHLConference;
  division: ECHLDivision;
  nhlTeamId: string;
  ahlTeamId: string;
  colors: {
    primary: string;
    secondary: string;
  };
  logo_path: string;
}

export interface CHLTeam {
  id: string;
  name: string;
  abbreviation: string;
  league: CHLLeague;
  conference: OHLConference | QMJHLConference | WHLConference;
  division: OHLDivision | QMJHLDivision | WHLDivision;
  colors: {
    primary: string;
    secondary: string;
  };
  logo_path: string;
}
