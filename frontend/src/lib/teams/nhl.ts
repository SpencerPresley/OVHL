import { NHLTeam, NHLConference, NHLDivision } from './types';
import nhlTeams from '@nhl-api/teams';

// Create a map of team IDs to colors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const teamColors = new Map(
  nhlTeams.map((team) => [
    team.abbreviation.toLowerCase(),
    {
      primary: team.colors[0],
      secondary: team.colors[1] || team.colors[0],
    },
  ])
);

export const NHL_TEAMS: NHLTeam[] = [
  // Eastern Conference - Atlantic Division
  {
    id: 'nhl_bos',
    abbreviation: 'BOS',
    name: 'Boston Bruins',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#FFB81C',
      secondary: '#000000',
    },
    logo_path: '/team_logos/nhl/BOS.svg',
  },
  {
    id: 'nhl_buf',
    abbreviation: 'BUF',
    name: 'Buffalo Sabres',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#003087',
      secondary: '#FFB81C',
    },
    logo_path: '/team_logos/nhl/BUF.svg',
  },
  {
    id: 'nhl_det',
    abbreviation: 'DET',
    name: 'Detroit Red Wings',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#CE1126',
      secondary: '#FFFFFF',
    },
    logo_path: '/team_logos/nhl/DET.svg',
  },
  {
    id: 'nhl_fla',
    abbreviation: 'FLA',
    name: 'Florida Panthers',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#041E42',
      secondary: '#C8102E',
    },
    logo_path: '/team_logos/nhl/FLA.svg',
  },
  {
    id: 'nhl_mtl',
    abbreviation: 'MTL',
    name: 'Montreal Canadiens',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#AF1E2D',
      secondary: '#192168',
    },
    logo_path: '/team_logos/nhl/MTL.svg',
  },
  {
    id: 'nhl_ott',
    abbreviation: 'OTT',
    name: 'Ottawa Senators',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#DA1A32',
      secondary: '#B79257',
    },
    logo_path: '/team_logos/nhl/OTT.svg',
  },
  {
    id: 'nhl_tbl',
    abbreviation: 'TBL',
    name: 'Tampa Bay Lightning',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#002868',
      secondary: '#FFFFFF',
    },
    logo_path: '/team_logos/nhl/TBL.svg',
  },
  {
    id: 'nhl_tor',
    abbreviation: 'TOR',
    name: 'Toronto Maple Leafs',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#00205B',
      secondary: '#FFFFFF',
    },
    logo_path: '/team_logos/nhl/TOR.svg',
  },

  // Eastern Conference - Metropolitan Division
  {
    id: 'nhl_car',
    abbreviation: 'CAR',
    name: 'Carolina Hurricanes',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#CE1126',
      secondary: '#FFFFFF',
    },
    logo_path: '/team_logos/nhl/CAR.svg',
  },
  {
    id: 'nhl_cbj',
    abbreviation: 'CBJ',
    name: 'Columbus Blue Jackets',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#002654',
      secondary: '#CE1126',
    },
    logo_path: '/team_logos/nhl/CBJ.svg',
  },
  {
    id: 'nhl_njd',
    abbreviation: 'NJD',
    name: 'New Jersey Devils',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#CE1126',
      secondary: '#000000',
    },
    logo_path: '/team_logos/nhl/NJD.svg',
  },
  {
    id: 'nhl_nyi',
    abbreviation: 'NYI',
    name: 'New York Islanders',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#00539B',
      secondary: '#F47D30',
    },
    logo_path: '/team_logos/nhl/NYI.svg',
  },
  {
    id: 'nhl_nyr',
    abbreviation: 'NYR',
    name: 'New York Rangers',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#0038A8',
      secondary: '#CE1126',
    },
    logo_path: '/team_logos/nhl/NYR.svg',
  },
  {
    id: 'nhl_phi',
    abbreviation: 'PHI',
    name: 'Philadelphia Flyers',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#F74902',
      secondary: '#000000',
    },
    logo_path: '/team_logos/nhl/PHI.svg',
  },
  {
    id: 'nhl_pit',
    abbreviation: 'PIT',
    name: 'Pittsburgh Penguins',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#000000',
      secondary: '#FCB514',
    },
    logo_path: '/team_logos/nhl/PIT.svg',
  },
  {
    id: 'nhl_wsh',
    abbreviation: 'WSH',
    name: 'Washington Capitals',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#041E42',
      secondary: '#C8102E',
    },
    logo_path: '/team_logos/nhl/WSH.svg',
  },

  // Western Conference - Central Division
  {
    id: 'nhl_uta',
    abbreviation: 'UTA',
    name: 'Utah Hockey Club',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#8C2633',
      secondary: '#E2D6B5',
    },
    logo_path: '/team_logos/nhl/UTA.svg',
  },
  {
    id: 'nhl_chi',
    abbreviation: 'CHI',
    name: 'Chicago Blackhawks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#CF0A2C',
      secondary: '#FF671B',
    },
    logo_path: '/team_logos/nhl/CHI.svg',
  },
  {
    id: 'nhl_col',
    abbreviation: 'COL',
    name: 'Colorado Avalanche',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#6F263D',
      secondary: '#236192',
    },
    logo_path: '/team_logos/nhl/COL.svg',
  },
  {
    id: 'nhl_dal',
    abbreviation: 'DAL',
    name: 'Dallas Stars',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#006847',
      secondary: '#8F8F8C',
    },
    logo_path: '/team_logos/nhl/DAL.svg',
  },
  {
    id: 'nhl_min',
    abbreviation: 'MIN',
    name: 'Minnesota Wild',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#A6192E',
      secondary: '#154734',
    },
    logo_path: '/team_logos/nhl/MIN.svg',
  },
  {
    id: 'nhl_nsh',
    abbreviation: 'NSH',
    name: 'Nashville Predators',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#FFB81C',
      secondary: '#041E42',
    },
    logo_path: '/team_logos/nhl/NSH.svg',
  },
  {
    id: 'nhl_stl',
    abbreviation: 'STL',
    name: 'St. Louis Blues',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#002F87',
      secondary: '#FCB514',
    },
    logo_path: '/team_logos/nhl/STL.svg',
  },
  {
    id: 'nhl_wpg',
    abbreviation: 'WPG',
    name: 'Winnipeg Jets',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#041E42',
      secondary: '#004C97',
    },
    logo_path: '/team_logos/nhl/WPG.svg',
  },

  // Western Conference - Pacific Division
  {
    id: 'nhl_ana',
    abbreviation: 'ANA',
    name: 'Anaheim Ducks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#F47A38',
      secondary: '#B9975B',
    },
    logo_path: '/team_logos/nhl/ANA.svg',
  },
  {
    id: 'nhl_cgy',
    abbreviation: 'CGY',
    name: 'Calgary Flames',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#D2001C',
      secondary: '#FAAF19',
    },
    logo_path: '/team_logos/nhl/CGY.svg',
  },
  {
    id: 'nhl_edm',
    abbreviation: 'EDM',
    name: 'Edmonton Oilers',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#041E42',
      secondary: '#FF4C00',
    },
    logo_path: '/team_logos/nhl/EDM.svg',
  },
  {
    id: 'nhl_lak',
    abbreviation: 'LAK',
    name: 'Los Angeles Kings',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#111111',
      secondary: '#A2AAAD',
    },
    logo_path: '/team_logos/nhl/LAK.svg',
  },
  {
    id: 'nhl_sjs',
    abbreviation: 'SJS',
    name: 'San Jose Sharks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#006D75',
      secondary: '#EA7200',
    },
    logo_path: '/team_logos/nhl/SJS.svg',
  },
  {
    id: 'nhl_sea',
    abbreviation: 'SEA',
    name: 'Seattle Kraken',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#001628',
      secondary: '#99D9D9',
    },
    logo_path: '/team_logos/nhl/SEA.svg',
  },
  {
    id: 'nhl_van',
    abbreviation: 'VAN',
    name: 'Vancouver Canucks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#00205B',
      secondary: '#00843D',
    },
    logo_path: '/team_logos/nhl/VAN.svg',
  },
  {
    id: 'nhl_vgk',
    abbreviation: 'VGK',
    name: 'Vegas Golden Knights',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#B4975A',
      secondary: '#333F42',
    },
    logo_path: '/team_logos/nhl/VGK.svg',
  },
];
