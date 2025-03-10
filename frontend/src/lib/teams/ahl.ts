import { AHLTeam, AHLDivision } from './types';

export const AHL_TEAMS: AHLTeam[] = [
  // Atlantic Division
  {
    id: 'bri',
    name: 'Bridgeport Islanders',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'nyi',
    colors: {
      primary: '#00468B',
      secondary: '#F26924',
    },
  },
  {
    id: 'cha',
    name: 'Charlotte Checkers',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'fla',
    colors: {
      primary: '#E51A38',
      secondary: '#000000',
    },
  },
  {
    id: 'hfd',
    name: 'Hartford Wolf Pack',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'nyr',
    colors: {
      primary: '#00548E',
      secondary: '#EF3E42',
    },
  },
  {
    id: 'her',
    name: 'Hershey Bears',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'wsh',
    colors: {
      primary: '#7E543A',
      secondary: '#472A2B',
    },
  },
  {
    id: 'lhv',
    name: 'Lehigh Valley Phantoms',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'phi',
    colors: {
      primary: '#F58220',
      secondary: '#000000',
    },
  },
  {
    id: 'pro',
    name: 'Providence Bruins',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'bos',
    colors: {
      primary: '#FBB337',
      secondary: '#000000',
    },
  },
  {
    id: 'spr',
    name: 'Springfield Thunderbirds',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'stl',
    colors: {
      primary: '#005CB9',
      secondary: '#041E41',
    },
  },
  {
    id: 'wbs',
    name: 'Wilkes-Barre/Scranton Penguins',
    division: AHLDivision.ATLANTIC,
    nhlTeamId: 'pit',
    colors: {
      primary: '#FEC23D',
      secondary: '#E31837',
    },
  },

  // North Division
  {
    id: 'bel',
    name: 'Belleville Senators',
    division: AHLDivision.NORTH,
    nhlTeamId: 'ott',
    colors: {
      primary: '#E3173E',
      secondary: '#000000',
    },
  },
  {
    id: 'cle',
    name: 'Cleveland Monsters',
    division: AHLDivision.NORTH,
    nhlTeamId: 'cbj',
    colors: {
      primary: '#005695',
      secondary: '#FDBB30',
    },
  },
  {
    id: 'lav',
    name: 'Laval Rocket',
    division: AHLDivision.NORTH,
    nhlTeamId: 'mtl',
    colors: {
      primary: '#001E61',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'roc',
    name: 'Rochester Americans',
    division: AHLDivision.NORTH,
    nhlTeamId: 'buf',
    colors: {
      primary: '#393A87',
      secondary: '#DE2944',
    },
  },
  {
    id: 'syr',
    name: 'Syracuse Crunch',
    division: AHLDivision.NORTH,
    nhlTeamId: 'tbl',
    colors: {
      primary: '#1D427C',
      secondary: '#AAA9AC',
    },
  },
  {
    id: 'tor',
    name: 'Toronto Marlies',
    division: AHLDivision.NORTH,
    nhlTeamId: 'tor',
    colors: {
      primary: '#003E7E',
      secondary: '#FFC425',
    },
  },
  {
    id: 'uti',
    name: 'Utica Comets',
    division: AHLDivision.NORTH,
    nhlTeamId: 'njd',
    colors: {
      primary: '#CF2031',
      secondary: '#000000',
    },
  },

  // Central Division
  {
    id: 'chi',
    name: 'Chicago Wolves',
    division: AHLDivision.CENTRAL,
    nhlTeamId: null, // Independent
    colors: {
      primary: '#939283',
      secondary: '#E03A3E',
    },
  },
  {
    id: 'gr',
    name: 'Grand Rapids Griffins',
    division: AHLDivision.CENTRAL,
    nhlTeamId: 'det',
    colors: {
      primary: '#866C3F',
      secondary: '#E51636',
    },
  },
  {
    id: 'ia',
    name: 'Iowa Wild',
    division: AHLDivision.CENTRAL,
    nhlTeamId: 'min',
    colors: {
      primary: '#144733',
      secondary: '#DFCAA3',
    },
  },
  {
    id: 'mb',
    name: 'Manitoba Moose',
    division: AHLDivision.CENTRAL,
    nhlTeamId: 'wpg',
    colors: {
      primary: '#041E41',
      secondary: '#A4A9AD',
    },
  },
  {
    id: 'mil',
    name: 'Milwaukee Admirals',
    division: AHLDivision.CENTRAL,
    nhlTeamId: 'nsh',
    colors: {
      primary: '#0E2B58',
      secondary: '#83C2EC',
    },
  },
  {
    id: 'rkf',
    name: 'Rockford IceHogs',
    division: AHLDivision.CENTRAL,
    nhlTeamId: 'chi',
    colors: {
      primary: '#DB1931',
      secondary: '#94959A',
    },
  },
  {
    id: 'tex',
    name: 'Texas Stars',
    division: AHLDivision.CENTRAL,
    nhlTeamId: 'dal',
    colors: {
      primary: '#1B6031',
      secondary: '#A5A6A8',
    },
  },

  // Pacific Division
  {
    id: 'abb',
    name: 'Abbotsford Canucks',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'van',
    colors: {
      primary: '#047835',
      secondary: '#0E1C2C',
    },
  },
  {
    id: 'bak',
    name: 'Bakersfield Condors',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'edm',
    colors: {
      primary: '#152342',
      secondary: '#DF4E10',
    },
  },
  {
    id: 'cgy',
    name: 'Calgary Wranglers',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'cgy',
    colors: {
      primary: '#C2273D',
      secondary: '#F3BD48',
    },
  },
  {
    id: 'cv',
    name: 'Coachella Valley Firebirds',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'sea',
    colors: {
      primary: '#C8102E',
      secondary: '#FF681D',
    },
  },
  {
    id: 'col',
    name: 'Colorado Eagles',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'col',
    colors: {
      primary: '#FFD457',
      secondary: '#19398A',
    },
  },
  {
    id: 'hnd',
    name: 'Henderson Silver Knights',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'vgk',
    colors: {
      primary: '#C2C4C6',
      secondary: '#B4975B',
    },
  },
  {
    id: 'ont',
    name: 'Ontario Reign',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'lak',
    colors: {
      primary: '#A4A9AD',
      secondary: '#000000',
    },
  },
  {
    id: 'sd',
    name: 'San Diego Gulls',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'ana',
    colors: {
      primary: '#FF4C00',
      secondary: '#0083BF',
    },
  },
  {
    id: 'sj',
    name: 'San Jose Barracuda',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'sjs',
    colors: {
      primary: '#266B73',
      secondary: '#DD8943',
    },
  },
  {
    id: 'tuc',
    name: 'Tucson Roadrunners',
    division: AHLDivision.PACIFIC,
    nhlTeamId: 'ari',
    colors: {
      primary: '#8E0A26',
      secondary: '#EEE2BE',
    },
  },
];
