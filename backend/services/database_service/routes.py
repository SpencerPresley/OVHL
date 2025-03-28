from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Dict, Any
from pydantic import BaseModel
from src.setup import handle_team_import

router = APIRouter(prefix="/api/db", tags=["database"])

@router.post("/insert-teams")
async def insert_teams(
    nhl_teams: List[Dict[str, Any]],
    ahl_teams: List[Dict[str, Any]],
    echl_teams: List[Dict[str, Any]],
    chl_teams: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Insert teams into database with proper affiliations"""
    try:
        result = await handle_team_import(
            nhl_teams=nhl_teams,
            ahl_teams=ahl_teams,
            echl_teams=echl_teams,
            chl_teams=chl_teams
        )
        return {
            "status": "success",
            "message": "Teams inserted successfully",
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error inserting teams: {str(e)}"
        )