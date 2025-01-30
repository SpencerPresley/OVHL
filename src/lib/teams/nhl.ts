import { NHLTeam, NHLConference, NHLDivision } from './types';
import nhlTeams from '@nhl-api/teams';

// Create a map of team IDs to colors
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
    id: 'bos',
    name: 'Boston Bruins',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#FFB81C',
      secondary: '#000000',
    },
  },
  {
    id: 'buf',
    name: 'Buffalo Sabres',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#003087',
      secondary: '#FFB81C',
    },
  },
  {
    id: 'det',
    name: 'Detroit Red Wings',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#CE1126',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'fla',
    name: 'Florida Panthers',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#041E42',
      secondary: '#C8102E',
    },
  },
  {
    id: 'mtl',
    name: 'Montreal Canadiens',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#AF1E2D',
      secondary: '#192168',
    },
  },
  {
    id: 'ott',
    name: 'Ottawa Senators',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#DA1A32',
      secondary: '#B79257',
    },
  },
  {
    id: 'tbl',
    name: 'Tampa Bay Lightning',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#002868',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'tor',
    name: 'Toronto Maple Leafs',
    conference: NHLConference.EASTERN,
    division: NHLDivision.ATLANTIC,
    colors: {
      primary: '#00205B',
      secondary: '#FFFFFF',
    },
  },

  // Eastern Conference - Metropolitan Division
  {
    id: 'car',
    name: 'Carolina Hurricanes',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#CE1126',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'cbj',
    name: 'Columbus Blue Jackets',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#002654',
      secondary: '#CE1126',
    },
  },
  {
    id: 'njd',
    name: 'New Jersey Devils',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#CE1126',
      secondary: '#000000',
    },
  },
  {
    id: 'nyi',
    name: 'New York Islanders',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#00539B',
      secondary: '#F47D30',
    },
  },
  {
    id: 'nyr',
    name: 'New York Rangers',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#0038A8',
      secondary: '#CE1126',
    },
  },
  {
    id: 'phi',
    name: 'Philadelphia Flyers',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#F74902',
      secondary: '#000000',
    },
  },
  {
    id: 'pit',
    name: 'Pittsburgh Penguins',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#000000',
      secondary: '#FCB514',
    },
  },
  {
    id: 'wsh',
    name: 'Washington Capitals',
    conference: NHLConference.EASTERN,
    division: NHLDivision.METROPOLITAN,
    colors: {
      primary: '#041E42',
      secondary: '#C8102E',
    },
  },

  // Western Conference - Central Division
  {
    id: 'ari',
    name: 'Arizona Coyotes',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#8C2633',
      secondary: '#E2D6B5',
    },
  },
  {
    id: 'chi',
    name: 'Chicago Blackhawks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#CF0A2C',
      secondary: '#FF671B',
    },
  },
  {
    id: 'col',
    name: 'Colorado Avalanche',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#6F263D',
      secondary: '#236192',
    },
  },
  {
    id: 'dal',
    name: 'Dallas Stars',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#006847',
      secondary: '#8F8F8C',
    },
  },
  {
    id: 'min',
    name: 'Minnesota Wild',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#A6192E',
      secondary: '#154734',
    },
  },
  {
    id: 'nsh',
    name: 'Nashville Predators',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#FFB81C',
      secondary: '#041E42',
    },
  },
  {
    id: 'stl',
    name: 'St. Louis Blues',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#002F87',
      secondary: '#FCB514',
    },
  },
  {
    id: 'wpg',
    name: 'Winnipeg Jets',
    conference: NHLConference.WESTERN,
    division: NHLDivision.CENTRAL,
    colors: {
      primary: '#041E42',
      secondary: '#004C97',
    },
  },

  // Western Conference - Pacific Division
  {
    id: 'ana',
    name: 'Anaheim Ducks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#F47A38',
      secondary: '#B9975B',
    },
  },
  {
    id: 'cgy',
    name: 'Calgary Flames',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#D2001C',
      secondary: '#FAAF19',
    },
  },
  {
    id: 'edm',
    name: 'Edmonton Oilers',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#041E42',
      secondary: '#FF4C00',
    },
  },
  {
    id: 'lak',
    name: 'Los Angeles Kings',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#111111',
      secondary: '#A2AAAD',
    },
  },
  {
    id: 'sjs',
    name: 'San Jose Sharks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#006D75',
      secondary: '#EA7200',
    },
  },
  {
    id: 'sea',
    name: 'Seattle Kraken',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#001628',
      secondary: '#99D9D9',
    },
  },
  {
    id: 'van',
    name: 'Vancouver Canucks',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#00205B',
      secondary: '#00843D',
    },
  },
  {
    id: 'vgk',
    name: 'Vegas Golden Knights',
    conference: NHLConference.WESTERN,
    division: NHLDivision.PACIFIC,
    colors: {
      primary: '#B4975A',
      secondary: '#333F42',
    },
  },
];
