from pydantic import BaseModel

class NewNHLTeam(BaseModel):
    _id: str
    abbreviation: str
    name: str
    conference: str
    division: str
    colors: dict[str, str]
    logo_path: str
    ahl_team_id: str
    echl_team_id: str
    
class NewAHLTeam(BaseModel):
    _id: str
    abbreviation: str
    name: str
    conference: str
    division: str
    colors: dict[str, str]
    nhl_team_id: str
    echl_team_id: str
    colors: dict[str, str]
    logo_path: str
    
class NewECHLTeam(BaseModel):
    _id: str
    abbreviation: str
    name: str
    conference: str
    division: str
    nhl_team_id: str
    ahl_team_id: str
    colors: dict[str, str]
    logo_path: str
    
class NewCHLTeam(BaseModel):
    _id: str
    abbreviation: str
    name: str
    league: str
    conference: str
    division: str
    colors: dict[str, str]
    logo_path: str