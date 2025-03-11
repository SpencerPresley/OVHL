from fastapi import APIRouter, HTTPException, Depends, Query, Path, Body
from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field
from general import (
    VerificationInput, 
    generate_platform_verification_code, 
    Platform,
    unmask_user_id
)

router = APIRouter(
    prefix="/api/security",
    tags=["security"]
)

class VerificationRequest(BaseModel):
    platform: str = Field(..., description="Gaming platform (PS or XBOX)")
    gamertag: str = Field(..., description="Player's gamertag")
    masked_user_id: str = Field(..., description="Masked User ID from the database")

@router.get("/status", include_in_schema=True)
async def api_status():
    """Get the status of the security service API"""
    return {
        "status": "online",
        "service": "security",
        "version": "0.1.0"
    }

@router.post("/platform-verification/generate-code")
async def generate_verification_code(
    platform: str = Query(..., description="Gaming platform (PS or XBOX)"),
    gamertag: str = Query(..., description="Player's gamertag"),
    masked_user_id: str = Query(..., description="Masked User ID from the database"),
):
    """Generate a verification code for a specific game platform using query parameters"""
    try:
        # Unmask the user ID
        user_id = unmask_user_id(masked_user_id)
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid or expired user ID token")
            
        # Convert string to enum
        platform_enum = Platform(platform)
         
        # Create the VerificationInput object
        input_data = VerificationInput(
            platform=platform_enum,
            gamertag=gamertag,
            user_id=user_id,
        )
        
        # Generate the code
        result = generate_platform_verification_code(input_data)
        return {
            "code": result, 
            "platform": platform, 
            "gamertag": gamertag, 
            "masked_user_id": masked_user_id
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")

@router.post("/platform-verification/generate-code/json")
async def generate_verification_code_json(request: VerificationRequest):
    """Generate a verification code for a specific game platform using JSON request body"""
    try:
        # Unmask the user ID
        user_id = unmask_user_id(request.masked_user_id)
        if user_id is None:
            raise HTTPException(status_code=400, detail="Invalid or expired user ID token")
            
        # Convert string to enum
        platform_enum = Platform(request.platform)
         
        # Create the VerificationInput object
        input_data = VerificationInput(
            platform=platform_enum,
            gamertag=request.gamertag,
            user_id=user_id,
        )
        
        # Generate the code
        result = generate_platform_verification_code(input_data)
        return {
            "code": result, 
            "platform": request.platform, 
            "gamertag": request.gamertag, 
            "masked_user_id": request.masked_user_id
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")