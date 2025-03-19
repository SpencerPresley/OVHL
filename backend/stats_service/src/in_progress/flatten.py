from typing import List
import json
from src.models import Match, PlayerStats
from src.ea_api import GetGamesRequest
from src.utils import WebRequest, PlatformValidator, MatchTypeValidator

def get_matches(club_ids: List[str]) -> List[Match]:
    """Get all matches for a given club using Pydantic models.
    
    This function fetches the last 5 matches (max ea returns) for a specific club based on the provided club ID,
    match type, and platform. 
    
    """
    all_matches = []
    web_request = WebRequest()
    platform_validator = PlatformValidator()
    match_type_validator = MatchTypeValidator()
    for club_id in club_ids:
        try:
            games_request = GetGamesRequest(
                club_id,
                "club_private",
                "common-gen5",
                web_request,
                platform_validator,
                match_type_validator,
            )
            matches = games_request.get_games()
            all_matches.extend(matches)
        except Exception as e:
            print(f"Error with club {club_id}, likely has opponent with missing details: {e}")
            input()
            # Continue with next club
            continue
        
    return all_matches
            

def flatten_to_player_stats(matches: List[Match]) -> List[dict]:
    """Extract player statistics and enrich with match, club, and player identifiers."""
    enriched_stats = []
    
    for match in matches:
        for club_id, players in match.players.items():
            for player_id, player_stat in players.items():
                # Convert player_stat to dict and add identifiers
                stat_dict = player_stat.model_dump()
                
                # Add identifiers
                stat_dict["match_id"] = match.match_id
                stat_dict["club_id"] = club_id
                stat_dict["player_id"] = player_id
                
                # Optionally add other match/club context
                if club_id in match.clubs:
                    club = match.clubs[club_id]
                    stat_dict["game_result"] = "win" if club.result == 1 else "loss"
                    stat_dict["home_away"] = "home" if club.team_side == 0 else "away"
                
                enriched_stats.append(stat_dict)
                
    return enriched_stats

if __name__ == "__main__":
    club_ids = [
        "20042", 
        "30019", 
        "35362", 
        "147082", 
        "4592", 
        "40106", 
        "6760", 
        "40295", 
        "21603", 
        "45048", 
        "29557", 
        "1509", 
        "2673"
    ]
    
    # Get matches
    print(f"Fetching matches for {len(club_ids)} clubs...")
    matches = get_matches(club_ids)
    print(f"Found {len(matches)} matches")
    
    # Save match data
    for i, match in enumerate(matches):
        with open(f"outputs/match_{i}.json", "w") as f:
            json.dump(match.model_dump(), f)
    
    # Flatten and enrich player stats
    print("Extracting player statistics...")
    player_stats = flatten_to_player_stats(matches)
    print(f"Found {len(player_stats)} player records")
    
    # Preview and save player stats
    for i, player_stat in enumerate(player_stats):
        # Print first few stats for preview
        if i < 3:  # Just show the first few
            print(f"\nPlayer {i+1}: {player_stat.get('player_name')} ({player_stat.get('position_abbreviation')})")
            print(f"Match: {player_stat.get('match_id')}, Club: {player_stat.get('club_id')}")
            print(f"Game Impact Score: {player_stat.get('game_impact_score')}")
        
        # Save to file - NO model_dump() here since player_stat is already a dict
        with open(f"outputs/player_stat_{i}.json", "w") as f:
            json.dump(player_stat, f, indent=4)
    
    print(f"\nWrote {len(player_stats)} player stats to files")

    # Optional: Create a pandas DataFrame
    try:
        import pandas as pd
        df = pd.DataFrame(player_stats)
        print(f"Created DataFrame with shape: {df.shape}")
        df.to_csv("outputs/player_stats.csv", index=False)
        print("Wrote player stats to CSV file")
    except ImportError:
        print("Pandas not available, skipping DataFrame creation")
            