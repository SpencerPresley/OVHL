from typing import List, Dict, Any
from .. import prisma_client
from .initialize_leagues import setup_league_hierarchy

async def insert_teams(
    nhl_teams: List[Dict[str, Any]],
    ahl_teams: List[Dict[str, Any]],
    echl_teams: List[Dict[str, Any]],
    chl_teams: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Insert teams into database with proper affiliations"""
    try:
        # First set up the league hierarchy
        hierarchy = await setup_league_hierarchy()
        
        if hierarchy["status"] != "success":
            return hierarchy
        
        leagues = hierarchy["leagues"]
        divisions = hierarchy["divisions"]
        
        # Get Prisma client
        await prisma_client.connect()
        
        try:
            # --- NHL TEAMS ---
            nhl_db_teams = []
            nhl_league = leagues.get("NHL")
            
            if nhl_league:
                # Fetch existing NHL teams
                existing_nhl_teams = await prisma_client.team.find_many(
                    where={
                        "id": {
                            "in": [team["_id"] for team in nhl_teams]
                        }
                    }
                )
                existing_nhl_map = {team.id: team for team in existing_nhl_teams}
                
                # Prepare operations
                nhl_teams_to_create = []
                nhl_teams_to_update = []
                
                for team in nhl_teams:
                    # Find the correct division
                    division_key = f"NHL_{team['division']}"
                    division = divisions.get(division_key)
                    
                    if not division:
                        continue
                    
                    team_data = {
                        "eaClubId": team["_id"],
                        "eaClubName": team["name"],
                        "fullTeamName": team["name"],
                        "teamAbbreviation": team["abbreviation"],
                        "logoPath": team["logo_path"],
                        "primaryColor": team["colors"]["primary"],
                        "secondaryColor": team["colors"]["secondary"],
                        "leagueId": nhl_league.id,
                        "divisionId": division.id
                    }
                    
                    if team["_id"] in existing_nhl_map:
                        # Update existing team
                        nhl_teams_to_update.append({
                            "id": team["_id"],
                            "data": team_data
                        })
                    else:
                        # Create new team
                        nhl_teams_to_create.append({
                            **team_data,
                            "id": team["_id"]
                        })
                
                # Execute operations
                for team_data in nhl_teams_to_create:
                    created_team = await prisma_client.team.create(data=team_data)
                    nhl_db_teams.append(created_team)
                
                for team_update in nhl_teams_to_update:
                    updated_team = await prisma_client.team.update(
                        where={"id": team_update["id"]},
                        data=team_update["data"]
                    )
                    nhl_db_teams.append(updated_team)
            
            # --- AHL TEAMS ---
            ahl_db_teams = []
            ahl_league = leagues.get("AHL")
            
            if ahl_league:
                # Fetch existing AHL teams
                existing_ahl_teams = await prisma_client.team.find_many(
                    where={
                        "id": {
                            "in": [team["_id"] for team in ahl_teams]
                        }
                    }
                )
                existing_ahl_map = {team.id: team for team in existing_ahl_teams}
                
                # Prepare operations
                ahl_teams_to_create = []
                ahl_teams_to_update = []
                
                for team in ahl_teams:
                    # Find the correct division
                    division_key = f"AHL_{team['division']}"
                    division = divisions.get(division_key)
                    
                    if not division:
                        continue
                    
                    # Find NHL affiliate
                    nhl_affiliate_id = None
                    if "nhl_team_id" in team and team["nhl_team_id"]:
                        nhl_team = next((t for t in nhl_db_teams if t.id == team["nhl_team_id"]), None)
                        if nhl_team:
                            nhl_affiliate_id = nhl_team.id
                    
                    team_data = {
                        "eaClubId": team["_id"],
                        "eaClubName": team["name"],
                        "fullTeamName": team["name"],
                        "teamAbbreviation": team["abbreviation"],
                        "logoPath": team["logo_path"],
                        "primaryColor": team["colors"]["primary"],
                        "secondaryColor": team["colors"]["secondary"],
                        "leagueId": ahl_league.id,
                        "divisionId": division.id,
                        "nhlAffiliateId": nhl_affiliate_id
                    }
                    
                    if team["_id"] in existing_ahl_map:
                        # Update existing team
                        ahl_teams_to_update.append({
                            "id": team["_id"],
                            "data": team_data
                        })
                    else:
                        # Create new team
                        ahl_teams_to_create.append({
                            **team_data,
                            "id": team["_id"]
                        })
                
                # Execute operations
                for team_data in ahl_teams_to_create:
                    created_team = await prisma_client.team.create(data=team_data)
                    ahl_db_teams.append(created_team)
                
                for team_update in ahl_teams_to_update:
                    updated_team = await prisma_client.team.update(
                        where={"id": team_update["id"]},
                        data=team_update["data"]
                    )
                    ahl_db_teams.append(updated_team)
            
            # --- ECHL TEAMS ---
            echl_db_teams = []
            echl_league = leagues.get("ECHL")
            
            if echl_league:
                # Fetch existing ECHL teams
                existing_echl_teams = await prisma_client.team.find_many(
                    where={
                        "id": {
                            "in": [team["_id"] for team in echl_teams]
                        }
                    }
                )
                existing_echl_map = {team.id: team for team in existing_echl_teams}
                
                # Prepare operations
                echl_teams_to_create = []
                echl_teams_to_update = []
                
                for team in echl_teams:
                    # Find the correct division
                    division_key = f"ECHL_{team['division']}"
                    division = divisions.get(division_key)
                    
                    if not division:
                        continue
                    
                    # Find NHL and AHL affiliates
                    nhl_affiliate_id = None
                    ahl_affiliate_id = None
                    
                    if "nhl_team_id" in team and team["nhl_team_id"]:
                        nhl_team = next((t for t in nhl_db_teams if t.id == team["nhl_team_id"]), None)
                        if nhl_team:
                            nhl_affiliate_id = nhl_team.id
                    
                    if "ahl_team_id" in team and team["ahl_team_id"]:
                        ahl_team = next((t for t in ahl_db_teams if t.id == team["ahl_team_id"]), None)
                        if ahl_team:
                            ahl_affiliate_id = ahl_team.id
                    
                    team_data = {
                        "eaClubId": team["_id"],
                        "eaClubName": team["name"],
                        "fullTeamName": team["name"],
                        "teamAbbreviation": team["abbreviation"],
                        "logoPath": team["logo_path"],
                        "primaryColor": team["colors"]["primary"],
                        "secondaryColor": team["colors"]["secondary"],
                        "leagueId": echl_league.id,
                        "divisionId": division.id,
                        "nhlAffiliateId": nhl_affiliate_id,
                        "ahlAffiliateId": ahl_affiliate_id
                    }
                    
                    if team["_id"] in existing_echl_map:
                        # Update existing team
                        echl_teams_to_update.append({
                            "id": team["_id"],
                            "data": team_data
                        })
                    else:
                        # Create new team
                        echl_teams_to_create.append({
                            **team_data,
                            "id": team["_id"]
                        })
                
                # Execute operations
                for team_data in echl_teams_to_create:
                    created_team = await prisma_client.team.create(data=team_data)
                    echl_db_teams.append(created_team)
                
                for team_update in echl_teams_to_update:
                    updated_team = await prisma_client.team.update(
                        where={"id": team_update["id"]},
                        data=team_update["data"]
                    )
                    echl_db_teams.append(updated_team)
            
            # --- CHL TEAMS ---
            chl_db_teams = []
            
            # Fetch all CHL sub-leagues (OHL, QMJHL, WHL)
            chl_leagues = {
                k: v for k, v in leagues.items() 
                if k in ["OHL", "QMJHL", "WHL"]
            }
            
            if chl_leagues:
                # Fetch existing CHL teams
                existing_chl_teams = await prisma_client.team.find_many(
                    where={
                        "id": {
                            "in": [team["_id"] for team in chl_teams]
                        }
                    }
                )
                existing_chl_map = {team.id: team for team in existing_chl_teams}
                
                # Prepare operations
                chl_teams_to_create = []
                chl_teams_to_update = []
                
                for team in chl_teams:
                    # Get the correct league
                    if "league" not in team:
                        continue
                        
                    league = chl_leagues.get(team["league"])
                    if not league:
                        continue
                    
                    # Find the correct division
                    division_key = f"{team['league']}_{team['division']}"
                    division = divisions.get(division_key)
                    
                    if not division:
                        continue
                    
                    team_data = {
                        "eaClubId": '',
                        "eaClubName": '',
                        "fullTeamName": team["name"],
                        "teamAbbreviation": team["abbreviation"],
                        "logoPath": team["logo_path"],
                        "primaryColor": team["colors"]["primary"],
                        "secondaryColor": team["colors"]["secondary"],
                        "leagueId": league.id,
                        "divisionId": division.id
                    }
                    
                    if team["_id"] in existing_chl_map:
                        # Update existing team
                        chl_teams_to_update.append({
                            "id": team["_id"],
                            "data": team_data
                        })
                    else:
                        # Create new team
                        chl_teams_to_create.append({
                            **team_data,
                            "id": team["_id"]
                        })
                
                # Execute operations
                for team_data in chl_teams_to_create:
                    created_team = await prisma_client.team.create(data=team_data)
                    chl_db_teams.append(created_team)
                
                for team_update in chl_teams_to_update:
                    updated_team = await prisma_client.team.update(
                        where={"id": team_update["id"]},
                        data=team_update["data"]
                    )
                    chl_db_teams.append(updated_team)
            
            return {
                "status": "success",
                "nhl_teams": len(nhl_db_teams),
                "ahl_teams": len(ahl_db_teams),
                "echl_teams": len(echl_db_teams),
                "chl_teams": len(chl_db_teams)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": str(e),
                "traceback": str(e.__traceback__)
            }
            
        finally:
            await prisma_client.disconnect()
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error setting up leagues and divisions: {str(e)}"
        }


# Example API handler function
async def handle_team_import(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle team import from API request
    
    Example request data:
    {
        "nhl_teams": [...],
        "ahl_teams": [...],
        "echl_teams": [...],
        "chl_teams": [...]
    }
    """
    nhl_teams = request_data.get("nhl_teams", [])
    ahl_teams = request_data.get("ahl_teams", [])
    echl_teams = request_data.get("echl_teams", [])
    chl_teams = request_data.get("chl_teams", [])
    
    result = await insert_teams(nhl_teams, ahl_teams, echl_teams, chl_teams)
    return result