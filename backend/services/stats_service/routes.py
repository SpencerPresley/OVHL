from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel
from typing import Dict, Any, List
from functools import lru_cache

from src.utils import WebRequest, PlatformValidator, MatchTypeValidator

from src.ea_api import GetClubsRequest, GetGamesRequest
from src.models import ClubResponse
from src.models import Match

# Create router with API prefix and tags for better documentation
router = APIRouter(prefix="/api/stats", tags=["clubs"])

# Create instances of required dependencies
web_request = WebRequest()
platform_validator = PlatformValidator()
match_type_validator = MatchTypeValidator()

# Create a cached version of the club request
@lru_cache(maxsize=100)  # Cache up to 100 different club requests
def get_cached_club_request(search_name: str, platform: str) -> GetClubsRequest:
    """Get a cached GetClubsRequest instance to avoid repetitive API calls. 
    
    Club data will be cached for the lifetime of the application or until cache is full.

    Args:
        search_name: The name of the club to search for
        platform: The gaming platform identifier

    Returns:
        Cached GetClubsRequest instance
    """
    return GetClubsRequest(
        search_name=search_name,
        platform=platform,
        web_request=web_request,
        platform_validator=platform_validator,
    )

class ClubResponse(BaseModel):
    club_id: int

class ClubDataResponse(BaseModel):
    club_data: Dict[str, Any]

class ClubFullResponse(BaseModel):
    club_id: int
    club_data: Dict[str, Any]
    
class MatchesResponse(BaseModel):
    matches: List[Match]

@router.get("/club/{search_name}/id", response_model=ClubResponse, summary="Get Club ID")
async def get_club_id(
    search_name: str = Path(..., description="The name of the club to search for"),
    platform: str | None = Query("common-gen5", description="The gaming platform identifier"),
):
    """Get the club ID for a given club name.

    This endpoint searches for a club by name and returns its ID.
    
    Args:
        search_name (str): Required. The name of the club to search for
        platform (str): Optional. The gaming platform identifier. Default is "common-gen5".

    Returns:
        A dictionary containing the club ID
    """
    try:
        # Use cached request
        club_request = get_cached_club_request(search_name, platform)
        club_id = club_request.get_club_id()
        return {"club_id": club_id}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving club ID: {str(e)}"
        )


@router.get("/club/{search_name}/data", response_model=ClubDataResponse, summary="Get Club Data")
async def get_club_data(
    search_name: str = Path(..., description="The name of the club to search for"),
    platform: str | None = Query("common-gen5", description="The gaming platform identifier"),
):
    """Get the club data for a given club name.

    This endpoint searches for a club by name and returns all its data.
    
    Args:
        search_name (str): Required. The name of the club to search for
        platform (str): Optional. The gaming platform identifier. Default is "common-gen5".

    Returns:
        A dictionary containing the club data
    """
    try:
        # Use cached request
        club_request = get_cached_club_request(search_name, platform)
        # Get the validated Pydantic model and convert to dict for JSON response
        club_data = club_request.get_club_data()
        return {"club_data": club_data.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving club data: {str(e)}"
        )


@router.get(
    "/club/{search_name}/full", response_model=ClubFullResponse, summary="Get Complete Club Info"
)
async def get_club_full(
    search_name: str = Path(..., description="The name of the club to search for"),
    platform: str | None = Query("common-gen5", description="The gaming platform identifier"),
):
    """Get both the club ID and complete club data for a given club name.

    This endpoint combines the functionality of the /club/id and /club/data endpoints.
    
    Args:
        search_name (str): Required. The name of the club to search for
        platform (str): Optional. The gaming platform identifier. Default is "common-gen5".

    Returns:
        A dictionary containing the club ID and club data
    """
    try:
        # Use cached request
        club_request = get_cached_club_request(search_name, platform)
        club_id = club_request.get_club_id()
        club_data = club_request.get_club_data()
        return {"club_id": club_id, "club_data": club_data.model_dump()}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving club information: {str(e)}"
        )

@router.get("/club/{club_id}/matches", summary="Get Club Matches")
async def get_club_matches(
    club_id: int = Path(..., description="The ID of the club to get matches for"),
    match_type: str | None = Query("club_private", description="The type of match to fetch"),
    platform: str | None = Query("common-gen5", description="The gaming platform identifier"),
):
    """Get all matches for a given club.

    This endpoint fetches the last 5 matches (max ea returns) for a specific club based on the provided club ID,
    match type, and platform. 
    
    Args:
        club_id (int): Required. The ID of the club to get matches for
        match_type (str): Optional. The type of match to fetch. Default is "club_private".
        platform (str): Optional. The gaming platform identifier. Default is "common-gen5".

    Returns:
        A list of matches
    """
    try:
        games_request = GetGamesRequest(
            club_id,
            match_type or "club_private", # If None is explicitly passed, default to club_private
            platform or "common-gen5", # If None is explicitly passed, default to common-gen5
            web_request,
            platform_validator,
            match_type_validator,
        )
        matches = games_request.get_games()
        return [match.model_dump() for match in matches]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving club matches: {str(e)}"
        )
        
@router.get("/club/{club_id}/matches/pydantic", summary="Get Club Matches")
async def get_club_matches_pydantic(
    club_id: int = Path(..., description="The ID of the club to get matches for"),
    match_type: str | None = Query("club_private", description="The type of match to fetch"),
    platform: str | None = Query("common-gen5", description="The gaming platform identifier"),
):
    """Get all matches for a given club using Pydantic models.

    This endpoint fetches the last 5 matches (max ea returns) for a specific club based on the provided club ID,
    match type, and platform. 
    
    """
    try:
        games_request = GetGamesRequest(
            club_id,
            match_type or "club_private", # If None is explicitly passed, default to club_private
            platform or "common-gen5", # If None is explicitly passed, default to common-gen5
            web_request,
            platform_validator,
            match_type_validator,
        )
        matches = games_request.get_games()
        return matches
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving club matches: {str(e)}"
        )