import { CHLTeam, CHLLeague, OHLDivision, QMJHLDivision, WHLDivision } from "./types";

export const CHL_TEAMS: CHLTeam[] = [
  // OHL Teams
  // East Division
  {
    id: "ham",
    name: "Hamilton Bulldogs",
    league: CHLLeague.OHL,
    division: OHLDivision.EAST,
  },
  {
    id: "kgn",
    name: "Kingston Frontenacs",
    league: CHLLeague.OHL,
    division: OHLDivision.EAST,
  },
  {
    id: "ott",
    name: "Ottawa 67's",
    league: CHLLeague.OHL,
    division: OHLDivision.EAST,
  },
  {
    id: "pet",
    name: "Peterborough Petes",
    league: CHLLeague.OHL,
    division: OHLDivision.EAST,
  },
  {
    id: "sud",
    name: "Sudbury Wolves",
    league: CHLLeague.OHL,
    division: OHLDivision.EAST,
  },

  // Central Division
  {
    id: "bar",
    name: "Barrie Colts",
    league: CHLLeague.OHL,
    division: OHLDivision.CENTRAL,
  },
  {
    id: "mis",
    name: "Mississauga Steelheads",
    league: CHLLeague.OHL,
    division: OHLDivision.CENTRAL,
  },
  {
    id: "nia",
    name: "Niagara IceDogs",
    league: CHLLeague.OHL,
    division: OHLDivision.CENTRAL,
  },
  {
    id: "nb",
    name: "North Bay Battalion",
    league: CHLLeague.OHL,
    division: OHLDivision.CENTRAL,
  },
  {
    id: "osh",
    name: "Oshawa Generals",
    league: CHLLeague.OHL,
    division: OHLDivision.CENTRAL,
  },

  // Midwest Division
  {
    id: "erie",
    name: "Erie Otters",
    league: CHLLeague.OHL,
    division: OHLDivision.MIDWEST,
  },
  {
    id: "gue",
    name: "Guelph Storm",
    league: CHLLeague.OHL,
    division: OHLDivision.MIDWEST,
  },
  {
    id: "kit",
    name: "Kitchener Rangers",
    league: CHLLeague.OHL,
    division: OHLDivision.MIDWEST,
  },
  {
    id: "ldn",
    name: "London Knights",
    league: CHLLeague.OHL,
    division: OHLDivision.MIDWEST,
  },
  {
    id: "os",
    name: "Owen Sound Attack",
    league: CHLLeague.OHL,
    division: OHLDivision.MIDWEST,
  },

  // West Division
  {
    id: "fnt",
    name: "Flint Firebirds",
    league: CHLLeague.OHL,
    division: OHLDivision.WEST,
  },
  {
    id: "sag",
    name: "Saginaw Spirit",
    league: CHLLeague.OHL,
    division: OHLDivision.WEST,
  },
  {
    id: "sar",
    name: "Sarnia Sting",
    league: CHLLeague.OHL,
    division: OHLDivision.WEST,
  },
  {
    id: "soo",
    name: "Soo Greyhounds",
    league: CHLLeague.OHL,
    division: OHLDivision.WEST,
  },
  {
    id: "wsr",
    name: "Windsor Spitfires",
    league: CHLLeague.OHL,
    division: OHLDivision.WEST,
  },

  // QMJHL Teams
  // East Division
  {
    id: "bat",
    name: "Acadie-Bathurst Titan",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.EAST,
  },
  {
    id: "cbe",
    name: "Cape Breton Eagles",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.EAST,
  },
  {
    id: "cha",
    name: "Charlottetown Islanders",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.EAST,
  },
  {
    id: "hal",
    name: "Halifax Mooseheads",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.EAST,
  },
  {
    id: "sjd",
    name: "Saint John Sea Dogs",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.EAST,
  },

  // Central Division
  {
    id: "bcd",
    name: "Baie-Comeau Drakkar",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.CENTRAL,
  },
  {
    id: "chi",
    name: "Chicoutimi Saguenéens",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.CENTRAL,
  },
  {
    id: "que",
    name: "Quebec Remparts",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.CENTRAL,
  },
  {
    id: "rim",
    name: "Rimouski Océanic",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.CENTRAL,
  },
  {
    id: "vic",
    name: "Victoriaville Tigres",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.CENTRAL,
  },

  // West Division
  {
    id: "bba",
    name: "Blainville-Boisbriand Armada",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.WEST,
  },
  {
    id: "dru",
    name: "Drummondville Voltigeurs",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.WEST,
  },
  {
    id: "gat",
    name: "Gatineau Olympiques",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.WEST,
  },
  {
    id: "rnh",
    name: "Rouyn-Noranda Huskies",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.WEST,
  },
  {
    id: "she",
    name: "Sherbrooke Phoenix",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.WEST,
  },
  {
    id: "vdo",
    name: "Val-d'Or Foreurs",
    league: CHLLeague.QMJHL,
    division: QMJHLDivision.WEST,
  },

  // WHL Teams
  // East Division
  {
    id: "bdn",
    name: "Brandon Wheat Kings",
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
  },
  {
    id: "mj",
    name: "Moose Jaw Warriors",
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
  },
  {
    id: "pa",
    name: "Prince Albert Raiders",
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
  },
  {
    id: "reg",
    name: "Regina Pats",
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
  },
  {
    id: "sas",
    name: "Saskatoon Blades",
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
  },
  {
    id: "sc",
    name: "Swift Current Broncos",
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
  },
  {
    id: "wpg",
    name: "Winnipeg ICE",
    league: CHLLeague.WHL,
    division: WHLDivision.EAST,
  },

  // Central Division
  {
    id: "cgy",
    name: "Calgary Hitmen",
    league: CHLLeague.WHL,
    division: WHLDivision.CENTRAL,
  },
  {
    id: "edm",
    name: "Edmonton Oil Kings",
    league: CHLLeague.WHL,
    division: WHLDivision.CENTRAL,
  },
  {
    id: "lbg",
    name: "Lethbridge Hurricanes",
    league: CHLLeague.WHL,
    division: WHLDivision.CENTRAL,
  },
  {
    id: "mh",
    name: "Medicine Hat Tigers",
    league: CHLLeague.WHL,
    division: WHLDivision.CENTRAL,
  },
  {
    id: "rd",
    name: "Red Deer Rebels",
    league: CHLLeague.WHL,
    division: WHLDivision.CENTRAL,
  },

  // B.C. Division
  {
    id: "kam",
    name: "Kamloops Blazers",
    league: CHLLeague.WHL,
    division: WHLDivision.BC,
  },
  {
    id: "kel",
    name: "Kelowna Rockets",
    league: CHLLeague.WHL,
    division: WHLDivision.BC,
  },
  {
    id: "pg",
    name: "Prince George Cougars",
    league: CHLLeague.WHL,
    division: WHLDivision.BC,
  },
  {
    id: "van",
    name: "Vancouver Giants",
    league: CHLLeague.WHL,
    division: WHLDivision.BC,
  },
  {
    id: "vic",
    name: "Victoria Royals",
    league: CHLLeague.WHL,
    division: WHLDivision.BC,
  },

  // U.S. Division
  {
    id: "eve",
    name: "Everett Silvertips",
    league: CHLLeague.WHL,
    division: WHLDivision.US,
  },
  {
    id: "por",
    name: "Portland Winterhawks",
    league: CHLLeague.WHL,
    division: WHLDivision.US,
  },
  {
    id: "sea",
    name: "Seattle Thunderbirds",
    league: CHLLeague.WHL,
    division: WHLDivision.US,
  },
  {
    id: "spo",
    name: "Spokane Chiefs",
    league: CHLLeague.WHL,
    division: WHLDivision.US,
  },
  {
    id: "tc",
    name: "Tri-City Americans",
    league: CHLLeague.WHL,
    division: WHLDivision.US,
  },
]; 