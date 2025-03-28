from typing import Dict, Any
from .. import prisma_client
from ..static import leagues_data, conference_data, division_data

async def create_leagues() -> Dict[str, Any]:
    await prisma_client.connect()
    
    try:
        existing_leagues = await prisma_client.league.find_many(
            where={
                "shortName": {
                    "in": [
                        league["shortName"] for league in leagues_data
                    ]
                }
            }
        )
        
        # Create a map of existing leagues by shortName
        existing_leagues_map = {
            league.short_name: league for league in existing_leagues
        }
        
        leagues_to_create = []
        update_operations = []
        
        for league_data in leagues_data:
            if league_data["shortName"] in existing_leagues_map:
                # Update existing league
                league = existing_leagues_map[
                    league_data["shortName"]
                ]
                update_operations.append(
                    prisma_client.league.update(
                        where={"id": league.id},
                        data={
                            "name": league_data["name"],
                            "leagueType": league_data["leagueType"],
                            "isSubLeague": league_data["isSubLeague"],
                        }
                    )
                )
            else: 
                # Create new leagues, excluding parentLeague for now
                create_data = {
                    "name": league_data["name"],
                    "shortName": league_data["shortName"],
                    "leagueType": league_data["leagueType"],
                    "isSubLeague": league_data["isSubLeague"],
                }
                leagues_to_create.append(create_data)
        
        # Executure operations
        # 1) Create new leagues
        if leagues_to_create:
            for league_data in leagues_to_create:
                await prisma_client.league.create(
                    data=league_data
                )
                
        # 2) Run updates in parallel
        if update_operations:
            await prisma_client.batch_(update_operations)
        
        # Get all leagues after operations
        all_leagues = await prisma_client.league.find_many()
        
        # Create a map of leagues by shortName
        league_map = {
            league.short_name: league for league in all_leagues
        }
        
        # Update parent relationships for sub-leagues
        parent_update_ops = []
        for league_data in leagues_data:
            if league_data.get("isSubLeague") and "parentLeague" in league_data:
                child_league = league_map.get(league_data["shortName"])
                parent_league = league_map.get(league_data["parentLeague"])
                
                if child_league and parent_league:
                    parent_update_ops.append(
                        prisma_client.league.update(
                            where={"id": child_league.id},
                            data={"parentLeagueId": parent_league.id}
                        )
                    )
        
        if parent_update_ops:
            await prisma_client.batch_(parent_update_ops)
            
        # Get updated leagues after parent relationships are set
        all_leagues = await prisma_client.league.find_many()
        league_map = {league.short_name: league for league in all_leagues}
        
        return {
            "status": "success",
            "leagues": league_map
        }
    
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
        
    finally:
        await prisma_client.disconnect()
    
async def create_conferences(leagues: Dict[str, Any]) -> Dict[str, Any]:
    await prisma_client.connect()
    
    try:
        all_conference_entries = []
        for league_name, conferences in conference_data.items():
            league = leagues.get(league_name)
            if not league:
                raise ValueError(f"League {league_name} not found")
            
            for conference_name in conferences:
                all_conference_entries.append({
                    "league_short_name": league_name,
                    "league_id": league.id,
                    "name": conference_name,
                })
                
        # Get existing conferences
        existing_conferences = await prisma_client.conference.find_many(
            where={
                "OR": [
                    {
                        "AND": [
                            {"name": entry["name"]},
                            {"leagueId": entry["league_id"]}
                        ]
                    }
                    for entry in all_conference_entries
                ]
            }
        )
        
        # Map of existing conferences
        existing_conferences_map = {}
        for conf in existing_conferences:
            key = f"{conf.name}_{conf.league_id}"
            existing_conferences_map[key] = conf
            
        # Prepare create and update operations
        conferences_to_create = []
        update_ops = []
        
        for entry in all_conference_entries:
            key = f"{entry['name']}_{entry['league_id']}"
            
            if key in existing_conferences_map:
                pass
            else:
                conferences_to_create.append({
                    "name": entry["name"],
                    "leagueId": entry["league_id"],
                })
                
        if conferences_to_create:
            for conf_data in conferences_to_create:
                await prisma_client.conference.create(data=conf_data)
                
        all_conferences = await prisma_client.conference.find_many()
        
        # Create a map of conferences by league and name
        conference_map = {}
        for conf in all_conferences:
            league = next((
                l for l in leagues.values()
                if l.id == conf.league_id
            ), None)
            if league:
                key = f"{league.short_name}_{conf.name}"
                conference_map[key] = conf
                
        return {
            "status": "success",
            "conferences": conference_map
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
        
    finally:
        await prisma_client.disconnect()
        
async def create_divisions(
    leagues: Dict[str, Any],
    conferences: Dict[str, Any]
) -> Dict[str, Any]:
    prisma_client.connect()
    
    try:
        all_division_entries = []
        for league_name, conference_divisions in division_data.items():
            league = leagues.get(league_name)
            if not league:
                raise ValueError(f"League {league_name} not found")
            
            for conference_name, divisions in conference_divisions.items():
                conference_key = f"{league_name}_{conference_name}"
                conference = conferences.get(conference_key)
                if not conference:
                    raise ValueError(f"Conference {conference_name} not found")
                
                for division_name in divisions:
                    all_division_entries.append({
                        "league_id": league.id,
                        "conference_id": conference.id,
                        "name": division_name,
                    })
                    
        existing_divisions = await prisma_client.division.find_many(
            where={
                "OR": [
                    {
                        "AND": [
                            {"name": entry["name"]},
                            {"leagueId": entry["league_id"]},
                        ]
                    }
                    for entry in all_division_entries
                ]
            }
        )
        
        existing_divisions_map = {}
        for div in existing_divisions:
            key = f"{div.name}_{div.league_id}"
            existing_divisions_map[key] = div
            
        divisions_to_create = []
        update_ops = []
        
        for entry in all_division_entries:
            key = f"{entry['name']}_{entry['league_id']}"
            
            if key in existing_divisions_map:
                # Update conference if needed
                div = existing_divisions_map[key]
                if div.conference_id != entry["conference_id"]:
                    update_ops.append(
                        prisma_client.division.update(
                            where={"id": div.id},
                            data={"conferenceId": entry["conference_id"]}
                        )
                    )
                else:
                    divisions_to_create.append({
                        "name": entry["name"],
                        "leagueId": entry["league_id"],
                        "conferenceId": entry["conference_id"],
                    })
                    
        if divisions_to_create:
            for div_data in divisions_to_create:
                await prisma_client.division.create(data=div_data)
                
        if update_ops:
            await prisma_client.batch_(update_ops)
            
        all_divisions = await prisma_client.division.find_many()
        
        division_map = {}
        for div in all_divisions:
            league = next((
                l for l in leagues.values()
                if l.id == div.league_id
            ), None)
            if league:
                key = f"{league.short_name}_{div.name}"
                division_map[key] = div
        
        return {
            "status": "success",
            "divisions": division_map
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
        
    finally:
        await prisma_client.disconnect()
        
async def setup_league_hierarchy() -> Dict[str, Any]:
    """Setup the complete league hierarchy"""
    try:
        # 1) Create leagues
        leagues_result = await create_leagues()
        if leagues_result["status"] != "success":
            return leagues_result

        leagues = leagues_result["leagues"]
        
        # 2) Create conferences using leagues
        conferences_result = await create_conferences(leagues)
        if conferences_result["status"] != "success":
            return conferences_result
        
        conferences = conferences_result["conferences"]
        
        # 3) Create divisions using leagues and conferences
        divisions_result = await create_divisions(leagues, conferences)
        if divisions_result["status"] != "success":
            return divisions_result
        
        divisions = divisions_result["divisions"]
        
        return {
            "status": "success",
            "leagues": leagues,
            "conferences": conferences,
            "divisions": divisions
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }