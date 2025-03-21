"""
Models for EA NHL match data.

This module provides models for match-level data from the EA NHL API,
including the relationships between clubs and players.
"""

from typing import Dict, Optional, Any
from pydantic import BaseModel, Field

from .club_match_stats import ClubMatchStats, ClubAggregateMatchStats
from .players_match_stats import PlayerStats


class TimeAgo(BaseModel):
    """Time elapsed since the match."""

    number: int
    unit: str


class Match(BaseModel):
    """
    Complete match data including all clubs and players.

    This model represents a single game, containing:
    - Match identification and timing
    - Club data for both teams
    - Player statistics for all players
    - Aggregate team statistics
    """

    # Match Identification
    match_id: str = Field(alias="matchId")
    timestamp: int
    time_ago: TimeAgo = Field(alias="timeAgo")

    # Team Data
    clubs: Dict[str, ClubMatchStats]  # club_id -> club stats
    players: Dict[str, Dict[str, PlayerStats]]  # club_id -> {player_id -> player stats}
    aggregate: Dict[str, ClubAggregateMatchStats]  # club_id -> aggregate stats
    
    # Analytics will be populated post-validation by the `get_analytics` method
    analytics: Optional[Dict[str, Any]] = None
    
    def model_post_init(self, __context: Any) -> None:
        """Runs post initialization and calculates and inserts analytics."""
        if self.analytics is None:
            self.analytics = self.get_analytics()

    @property
    def home_club_id(self) -> str:
        """Get the ID of the home club (team_side = 0)."""
        for club_id, club in self.clubs.items():
            if club.team_side == 0:
                return club_id
        return None

    @property
    def away_club_id(self) -> str:
        """Get the ID of the away club (team_side = 1)."""
        for club_id, club in self.clubs.items():
            if club.team_side == 1:
                return club_id
        return None

    @property
    def home_club(self) -> ClubMatchStats:
        """Get the home club's stats."""
        club_id = self.home_club_id
        return self.clubs.get(club_id) if club_id else None

    @property
    def away_club(self) -> ClubMatchStats:
        """Get the away club's stats."""
        club_id = self.away_club_id
        return self.clubs.get(club_id) if club_id else None

    @property
    def home_players(self) -> Dict[str, PlayerStats]:
        """Get all players from the home team."""
        club_id = self.home_club_id
        return self.players.get(club_id, {}) if club_id else {}

    @property
    def away_players(self) -> Dict[str, PlayerStats]:
        """Get all players from the away team."""
        club_id = self.away_club_id
        return self.players.get(club_id, {}) if club_id else {}

    @property
    def home_aggregate(self) -> ClubAggregateMatchStats:
        """Get aggregate stats for the home team."""
        club_id = self.home_club_id
        return self.aggregate.get(club_id) if club_id else None

    @property
    def away_aggregate(self) -> ClubAggregateMatchStats:
        """Get aggregate stats for the away team."""
        club_id = self.away_club_id
        return self.aggregate.get(club_id) if club_id else None

    def get_club_players(self, club_id: str) -> Dict[str, PlayerStats]:
        """
        Get all players for a specific club.

        Args:
            club_id: The ID of the club

        Returns:
            Dict mapping player IDs to their stats
        """
        return self.players.get(club_id, {})

    def get_player_stats(self, club_id: str, player_id: str) -> PlayerStats:
        """
        Get stats for a specific player.

        Args:
            club_id: The ID of the club
            player_id: The ID of the player

        Returns:
            PlayerStats if found, None otherwise
        """
        return self.players.get(club_id, {}).get(player_id)

    def get_club_aggregate(self, club_id: str) -> ClubAggregateMatchStats:
        """
        Get aggregate stats for a specific club.

        Args:
            club_id: The ID of the club

        Returns:
            AggregateStats if found, None otherwise
        """
        return self.aggregate.get(club_id)
    
    def get_analytics(self) -> Dict[str, Optional[object]]:
        """
        Calculate and return all analytics metrics for this match.
        
        Returns:
            Dictionary containing all metrics categories
        """
        # Import here to avoid circular imports
        from .match_analytics import MatchAnalytics
        
        # Create a MatchAnalytics instance with this match
        analytics = MatchAnalytics(self)
        
        # Return all metrics
        return analytics.get_all_metrics()