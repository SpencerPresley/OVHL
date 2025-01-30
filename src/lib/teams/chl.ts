import {
  CHLTeam,
  CHLLeague,
  OHLDivision,
  QMJHLDivision,
  WHLDivision,
  NAJHLDivision,
} from './types';

export const CHL_TEAMS: CHLTeam[] = [
  // OHL Teams
  // East Division
  {
    id: 'ham',
    name: 'Brantford Bulldogs',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#231F20',
      secondary: '#B47F3A',
    },
  },
  {
    id: 'kgn',
    name: 'Kingston Frontenacs',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#FCBA32',
      secondary: '#000000',
    },
  },
  {
    id: 'ott',
    name: "Ottawa 67's",
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#AC1F2D',
      secondary: '#000000',
    },
  },
  {
    id: 'pet',
    name: 'Peterborough Petes',
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#94002A',
      secondary: '#000000',
    },
  },
  {
    id: 'sud',
    name: 'Sudbury Wolves',
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#231F20',
      secondary: '#000000',
    },
  },

  // Central Division
  {
    id: 'bar',
    name: 'Barrie Colts',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#FFD548',
      secondary: '#EC1B02',
    },
  },
  {
    id: 'brp',
    name: 'Bramptom Steelheads',
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#1A2857',
      secondary: '#8F9090',
    },
  },
  {
    id: 'nia',
    name: 'Niagara IceDogs',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#BF0C26',
      secondary: '#4C4E52',
    },
  },
  {
    id: 'nb',
    name: 'North Bay Battalion',
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#807A11',
      secondary: '#ED192D',
    },
  },
  {
    id: 'osh',
    name: 'Oshawa Generals',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#E21836',
      secondary: '#002D62',
    },
  },

  // Midwest Division
  {
    id: 'erie',
    name: 'Erie Otters',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.EAST,
    colors: {
      primary: '#FEC52F',
      secondary: '#0A1E3F',
    },
  },
  {
    id: 'gue',
    name: 'Guelph Storm',
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#900027',
      secondary: '#B3B5B8',
    },
  },
  {
    id: 'kit',
    name: 'Kitchener Rangers',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#CF0A2C',
      secondary: '#0033A0',
    },
  },
  {
    id: 'ldn',
    name: 'London Knights',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#27824D',
      secondary: '#FEB81C',
    },
  },
  {
    id: 'os',
    name: 'Owen Sound Attack',
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#FFDD00',
      secondary: '#E03A3E',
    },
  },

  // West Division
  {
    id: 'fnt',
    name: 'Flint Firebirds',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#0C1D3C',
      secondary: '#FC5D00',
    },
  },
  {
    id: 'sag',
    name: 'Saginaw Spirit',
    league: CHLLeague.OHL,
    division: NAJHLDivision.EAST,
    colors: {
      primary: '#003263',
      secondary: '#BE2F38',
    },
  },
  {
    id: 'sar',
    name: 'Sarnia Sting',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.EAST,
    colors: {
      primary: '#FFC425',
      secondary: '#231F20',
    },
  },
  {
    id: 'soo',
    name: 'Sault Ste. Marie Greyhounds',
    league: CHLLeague.OHL,
    division: OHLDivision.NORTH,
    colors: {
      primary: '#CF2029',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'wsr',
    name: 'Windsor Spitfires',
    league: CHLLeague.OHL,
    division: OHLDivision.SOUTH,
    colors: {
      primary: '#00274D',
      secondary: '#E31B23',
    },
  },

  // QMJHL Teams
  // East Division
  {
    id: 'bat',
    name: 'Acadie-Bathurst Titan',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#CFAA79',
      secondary: '#000000',
    },
  },
  {
    id: 'cbe',
    name: 'Cape Breton Eagles',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#FAB406',
      secondary: '#23282B',
    },
  },
  {
    id: 'cha',
    name: 'Charlottetown Islanders',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#A8996E',
      secondary: '#000000',
    },
  },
  {
    id: 'hal',
    name: 'Halifax Mooseheads',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#006F51',
      secondary: '#E31837',
    },
  },
  {
    id: 'sjd',
    name: 'Saint John Sea Dogs',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#B1B6BD',
      secondary: '#4274A6',
    },
  },

  // Central Division
  {
    id: 'bcd',
    name: 'Baie-Comeau Drakkar',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#FFCC02',
      secondary: '#EC1C24',
    },
  },
  {
    id: 'chi',
    name: 'Chicoutimi Saguenéens',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#3AB4E7',
      secondary: '#003263',
    },
  },
  {
    id: 'que',
    name: 'Quebec Remparts',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#E31836',
      secondary: '#000000',
    },
  },
  {
    id: 'rim',
    name: 'Rimouski Océanic',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#18124B',
      secondary: '#ABD8C0',
    },
  },
  {
    id: 'vic',
    name: 'Victoriaville Tigres',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.EAST,
    colors: {
      primary: '#FCB827',
      secondary: '#EC1C2E',
    },
  },

  // West Division
  {
    id: 'bba',
    name: 'Blainville-Boisbriand Armada',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'dru',
    name: 'Drummondville Voltigeurs',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#EE3224',
      secondary: '#000000',
    },
  },
  {
    id: 'gat',
    name: 'Gatineau Olympiques',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#717073',
      secondary: '#000000',
    },
  },
  {
    id: 'rnh',
    name: 'Rouyn-Noranda Huskies',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#ED1C2E',
      secondary: '#8E979D',
    },
  },
  {
    id: 'she',
    name: 'Sherbrooke Phoenix',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.EAST,
    colors: {
      primary: '#051B54',
      secondary: '#F8F2D7',
    },
  },
  {
    id: 'vdo',
    name: "Val-d'Or Foreurs",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.NORTH,
    colors: {
      primary: '#DDB208',
      secondary: '#005941',
    },
  },

  // WHL Teams
  // East Division
  {
    id: 'bdn',
    name: 'Brandon Wheat Kings',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#E6BF2E',
      secondary: '#000000',
    },
  },
  {
    id: 'mj',
    name: 'Moose Jaw Warriors',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#CC0000',
      secondary: '#000000',
    },
  },
  {
    id: 'pa',
    name: 'Prince Albert Raiders',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#0D843E',
      secondary: '#DAC796',
    },
  },
  {
    id: 'reg',
    name: 'Regina Pats',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#1A3668',
      secondary: '#EF3342',
    },
  },
  {
    id: 'sas',
    name: 'Saskatoon Blades',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#FFCD36',
      secondary: '#262266',
    },
  },
  {
    id: 'sc',
    name: 'Swift Current Broncos',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#026937',
      secondary: '#001F5B',
    },
  },
  {
    id: 'wnw',
    name: 'Wenatchee Wild',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#002F87',
      secondary: '#FFFFFF',
    },
  },

  // Central Division
  {
    id: 'cgy',
    name: 'Calgary Hitmen',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#E13A3E',
      secondary: '#9E7053',
    },
  },
  {
    id: 'edm',
    name: 'Edmonton Oil Kings',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#FFC42A',
      secondary: '#048743',
    },
  },
  {
    id: 'lbg',
    name: 'Lethbridge Hurricanes',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#CC1D30',
      secondary: '#121942',
    },
  },
  {
    id: 'mh',
    name: 'Medicine Hat Tigers',
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
    colors: {
      primary: '#E56B1F',
      secondary: '#C03440',
    },
  },
  {
    id: 'rd',
    name: 'Red Deer Rebels',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#900028',
      secondary: '#000000',
    },
  },

  // B.C. Division
  {
    id: 'kam',
    name: 'Kamloops Blazers',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#032C62',
      secondary: '#D0471D',
    },
  },
  {
    id: 'kel',
    name: 'Kelowna Rockets',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#008394',
      secondary: '#000000',
    },
  },
  {
    id: 'pg',
    name: 'Prince George Cougars',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#D0202E',
      secondary: '#D0A176',
    },
  },
  {
    id: 'van',
    name: 'Vancouver Giants',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#B5B7B9',
      secondary: '#97002E',
    },
  },
  {
    id: 'vic',
    name: 'Victoria Royals',
    league: CHLLeague.WHL,
    division: WHLDivision.WEST,
    colors: {
      primary: '#013974',
      secondary: '#A4ADB4',
    },
  },

  // U.S. Division
  {
    id: 'eve',
    name: 'Everett Silvertips',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#BC8448',
      secondary: '#045B41',
    },
  },
  {
    id: 'por',
    name: 'Portland Winterhawks',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#CC202E',
      secondary: '#BE9D4D',
    },
  },
  {
    id: 'sea',
    name: 'Seattle Thunderbirds',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#003876',
      secondary: '#008357',
    },
  },
  {
    id: 'spo',
    name: 'Spokane Chiefs',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#C41230',
      secondary: '#013A81',
    },
  },
  {
    id: 'tc',
    name: 'Tri-City Americans',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#0D1D41',
      secondary: '#AC1A2D',
    },
  },
  {
    id: 'elj',
    name: 'Elmira Jackals',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.EAST,
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'spf',
    name: 'Springfield Falcons',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.EAST,
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'okc',
    name: 'Oklahoma City Barons',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'sth',
    name: 'Stockton Heat',
    league: CHLLeague.NAJHL,
    division: NAJHLDivision.WEST,
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
    },
  },
  {
    id: 'shc',
    name: 'Shawinigan Cataractes',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#FFC425',
      secondary: '#98002E',
    },
  },
  {
    id: 'mnw',
    name: 'Moncton Wildcats',
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.SOUTH,
    colors: {
      primary: '#FDC13D',
      secondary: '#D51E3C',
    },
  },
];
