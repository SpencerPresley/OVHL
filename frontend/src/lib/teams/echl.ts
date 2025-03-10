import { ECHLTeam, ECHLDivision } from './types';

export const ECHL_TEAMS: ECHLTeam[] = [
  // North Division
  {
    id: 'nfl',
    name: 'Newfoundland Growlers',
    division: ECHLDivision.NORTH,
    nhlTeamId: 'tor',
    ahlTeamId: 'tor',
    colors: {
      primary: '#ad9567',
      secondary: '#000000',
    },
  },
  {
    id: 'adk',
    name: 'Adirondack Thunder',
    division: ECHLDivision.NORTH,
    nhlTeamId: 'njd',
    ahlTeamId: 'uti',
    colors: {
      primary: '#d2202f',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'mai',
    name: 'Maine Mariners',
    division: ECHLDivision.NORTH,
    nhlTeamId: 'bos',
    ahlTeamId: 'pro',
    colors: {
      primary: '#203950',
      secondary: '#5fa853',
    },
  },
  {
    id: 'nor',
    name: 'Norfolk Admirals',
    division: ECHLDivision.NORTH,
    nhlTeamId: 'wpg',
    ahlTeamId: 'mb',
    colors: {
      primary: '#012369',
      secondary: '#fcc343',
    },
  },
  {
    id: 'rea',
    name: 'Reading Royals',
    division: ECHLDivision.NORTH,
    nhlTeamId: 'phi',
    ahlTeamId: 'lhv',
    colors: {
      primary: '#634293',
      secondary: '#a8b1b7',
    },
  },
  {
    id: 'tro',
    name: 'Trois-Rivières Lions',
    division: ECHLDivision.NORTH,
    nhlTeamId: 'mtl',
    ahlTeamId: 'lav',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'wor',
    name: 'Worcester Railers',
    division: ECHLDivision.NORTH,
    nhlTeamId: 'nyi',
    ahlTeamId: 'bri',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },

  // South Division
  {
    id: 'atl',
    name: 'Atlanta Gladiators',
    division: ECHLDivision.SOUTH,
    nhlTeamId: 'ari',
    ahlTeamId: 'tuc',
    colors: {
      primary: '#081e3f',
      secondary: '#f8a01b',
    },
  },
  {
    id: 'fla',
    name: 'Florida Everblades',
    division: ECHLDivision.SOUTH,
    nhlTeamId: 'nsh',
    ahlTeamId: 'mil',
    colors: {
      primary: '#25315d',
      secondary: '#2c6956',
    },
  },
  {
    id: 'grn',
    name: 'Greenville Swamp Rabbits',
    division: ECHLDivision.SOUTH,
    nhlTeamId: 'lak',
    ahlTeamId: 'ont',
    colors: {
      primary: '#11244b',
      secondary: '#c06128',
    },
  },
  {
    id: 'jax',
    name: 'Jacksonville Icemen',
    division: ECHLDivision.SOUTH,
    nhlTeamId: 'nyr',
    ahlTeamId: 'hfd',
    colors: {
      primary: '#0c1e3f',
      secondary: '#9ca8b0',
    },
  },
  {
    id: 'orl',
    name: 'Orlando Solar Bears',
    division: ECHLDivision.SOUTH,
    nhlTeamId: 'tbl',
    ahlTeamId: 'syr',
    colors: {
      primary: '#4b2a91',
      secondary: '#0088a7',
    },
  },
  {
    id: 'sav',
    name: 'Savannah Ghost Pirates',
    division: ECHLDivision.SOUTH,
    nhlTeamId: 'vgk',
    ahlTeamId: 'hnd',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'sc',
    name: 'South Carolina Stingrays',
    division: ECHLDivision.SOUTH,
    nhlTeamId: 'wsh',
    ahlTeamId: 'her',
    colors: {
      primary: '#003466',
      secondary: '#c4112f',
    },
  },

  // Central Division
  {
    id: 'qc',
    name: 'Quad City Mallards',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'stl',
    ahlTeamId: 'spr',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'blm',
    name: 'Bloomington Bison',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'car',
    ahlTeamId: 'chi',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'cin',
    name: 'Cincinnati Cyclones',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'buf',
    ahlTeamId: 'roc',
    colors: {
      primary: '#de0e2c',
      secondary: '#bfc0c1',
    },
  },
  {
    id: 'fw',
    name: 'Fort Wayne Komets',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'edm',
    ahlTeamId: 'bak',
    colors: {
      primary: '#ed5816',
      secondary: '#000000',
    },
  },
  {
    id: 'ind',
    name: 'Indy Fuel',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'chi',
    ahlTeamId: 'rkf',
    colors: {
      primary: '#b92a30',
      secondary: '#ffc557',
    },
  },
  {
    id: 'iowa',
    name: 'Iowa Heartlanders',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'min',
    ahlTeamId: 'ia',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'kal',
    name: 'Kalamazoo Wings',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'cbj',
    ahlTeamId: 'cle',
    colors: {
      primary: '#d82e3a',
      secondary: '#283c82',
    },
  },
  {
    id: 'tol',
    name: 'Toledo Walleye',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'det',
    ahlTeamId: 'gr',
    colors: {
      primary: '#6799c8',
      secondary: '#ffc425',
    },
  },
  {
    id: 'whl',
    name: 'Wheeling Nailers',
    division: ECHLDivision.CENTRAL,
    nhlTeamId: 'pit',
    ahlTeamId: 'wbs',
    colors: {
      primary: '#b5a167',
      secondary: '#000000',
    },
  },

  // Mountain Division
  {
    id: 'ala',
    name: 'Alaska Aces',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'van',
    ahlTeamId: 'abf',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'tah',
    name: 'Tahoe Knight Monsters',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'vgk',
    ahlTeamId: 'hnd',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'all',
    name: 'Allen Americans',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'ott',
    ahlTeamId: 'bel',
    colors: {
      primary: '#bf1e2d',
      secondary: '#00153a',
    },
  },
  {
    id: 'idh',
    name: 'Idaho Steelheads',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'dal',
    ahlTeamId: 'tex',
    colors: {
      primary: '#00457c',
      secondary: '#c3cdcf',
    },
  },
  {
    id: 'kc',
    name: 'Kansas City Mavericks',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'sea',
    ahlTeamId: 'cv',
    colors: {
      primary: '#5c9dbf',
      secondary: '#eb8c36',
    },
  },
  {
    id: 'rc',
    name: 'Rapid City Rush',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'cgy',
    ahlTeamId: 'cgy',
    colors: {
      primary: '#a4162c',
      secondary: '#b4a66c',
    },
  },
  {
    id: 'tul',
    name: 'Tulsa Oilers',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'ana',
    ahlTeamId: 'sd',
    colors: {
      primary: '#111e3a',
      secondary: '#792131',
    },
  },
  {
    id: 'uta',
    name: 'Utah Grizzlies',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'col',
    ahlTeamId: 'col',
    colors: {
      primary: '#00483a',
      secondary: '#a57a2f',
    },
  },
  {
    id: 'wic',
    name: 'Wichita Thunder',
    division: ECHLDivision.MOUNTAIN,
    nhlTeamId: 'sjs',
    ahlTeamId: 'sj',
    colors: {
      primary: '#0059ab',
      secondary: '#808588',
    },
  },
];
