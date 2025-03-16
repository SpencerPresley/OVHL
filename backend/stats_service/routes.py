from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel
from typing import Dict, Any

from src.utils import WebRequest, PlatformValidator
from src.ea_api import GetClubsRequest

# Create router with API prefix and tags for better documentation
router = APIRouter(
    prefix="/api",
    tags=["clubs"]
)

# Create instances of required dependencies
web_request = WebRequest()
platform_validator = PlatformValidator()

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
    platform: str = Query("common-gen5", description="The gaming platform identifier")
):
    """
    Get the club ID for a given club name.
    
    This endpoint searches for a club by name and returns its ID.
    """
    try:
        club_request = GetClubsRequest(
            search_name=search_name,
            platform=platform,
            web_request=web_request,
            platform_validator=platform_validator
        )
        club_id = club_request.get_club_id()
        return {"club_id": club_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving club ID: {str(e)}")

@router.get("/club/data", response_model=ClubDataResponse, summary="Get Club Data")
async def get_club_data(
    search_name: str = Query(..., description="The name of the club to search for"),
    platform: str = Query("common-gen5", description="The gaming platform identifier")
):
    """
    Get the club data for a given club name.
    
    This endpoint searches for a club by name and returns all its data.
    """
    try:
        club_request = GetClubsRequest(
            search_name=search_name,
            platform=platform,
            web_request=web_request,
            platform_validator=platform_validator
        )
        # Use the private _club_data attribute. In a production environment,
        # we should add a proper getter for this in the GetClubsRequest class
        club_data = club_request._club_data
        return {"club_data": club_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving club data: {str(e)}")

@router.get("/club/full", response_model=ClubFullResponse, summary="Get Complete Club Info")
async def get_club_full(
    search_name: str = Query(..., description="The name of the club to search for"),
    platform: str = Query("common-gen5", description="The gaming platform identifier")
):
    """
    Get both the club ID and complete club data for a given club name.
    
    This endpoint combines the functionality of the /club/id and /club/data endpoints.
    """
    try:
        club_request = GetClubsRequest(
            search_name=search_name,
            platform=platform,
            web_request=web_request,
            platform_validator=platform_validator
        )
        club_id = club_request.get_club_id()
        club_data = club_request._club_data
        return {"club_id": club_id, "club_data": club_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving club information: {str(e)}") 