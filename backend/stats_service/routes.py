from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel
from typing import Dict, Any, Union
from functools import lru_cache

from src.utils import WebRequest, PlatformValidator
from src.ea_api import GetClubsRequest
from src.models import ClubResponse

# Create router with API prefix and tags for better documentation
router = APIRouter(prefix="/api", tags=["clubs"])

# Create instances of required dependencies
web_request = WebRequest()
platform_validator = PlatformValidator()


# Create a cached version of the club request
@lru_cache(maxsize=100)  # Cache up to 100 different club requests
def get_cached_club_request(search_name: str, platform: str) -> GetClubsRequest:
    """
    Get a cached GetClubsRequest instance to avoid repetitive API calls.
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


@router.get("/club/id", response_model=ClubResponse, summary="Get Club ID")
async def get_club_id(
    search_name: str = Query(..., description="The name of the club to search for"),
    platform: str = Query("common-gen5", description="The gaming platform identifier"),
):
    """
    Get the club ID for a given club name.

    This endpoint searches for a club by name and returns its ID.
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


@router.get("/club/data", response_model=ClubDataResponse, summary="Get Club Data")
async def get_club_data(
    search_name: str = Query(..., description="The name of the club to search for"),
    platform: str = Query("common-gen5", description="The gaming platform identifier"),
):
    """
    Get the club data for a given club name.

    This endpoint searches for a club by name and returns all its data.
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
    "/club/full", response_model=ClubFullResponse, summary="Get Complete Club Info"
)
async def get_club_full(
    search_name: str = Query(..., description="The name of the club to search for"),
    platform: str = Query("common-gen5", description="The gaming platform identifier"),
):
    """
    Get both the club ID and complete club data for a given club name.

    This endpoint combines the functionality of the /club/id and /club/data endpoints.
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
