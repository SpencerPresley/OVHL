"""Models for EA NHL player statistics.

This module provides models for player-level game statistics from the EA NHL API,
including both skater and goalie statistics.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator, computed_field


class PlayerStats(BaseModel):
    """Comprehensive player statistics for a single game.

    Contains all stats for both skater and goalie positions, along with
    general player and game information.
    """

    # Basic Information
    player_level: int = Field(alias="class")  # Player's level in the game
    position: str
    pos_sorted: int = Field(alias="posSorted")
    player_name: str = Field(alias="playername")
    client_platform: str = Field(alias="clientPlatform")
    player_level_display: int = Field(alias="playerLevel")  # Level shown in-game

    # Game Status
    is_guest: int = Field(alias="isGuest")
    player_dnf: int = Field(alias="player_dnf")
    pnhl_online_game_type: str = Field(alias="pNhlOnlineGameType")

    # Team Information
    team_id: int = Field(alias="teamId")
    team_side: int = Field(alias="teamSide")
    opponent_club_id: str = Field(alias="opponentClubId")
    opponent_team_id: int = Field(alias="opponentTeamId")
    opponent_score: int = Field(alias="opponentScore")
    score: int

    # Player Ratings
    rating_defense: float = Field(alias="ratingDefense")
    rating_offense: float = Field(alias="ratingOffense")
    rating_teamplay: float = Field(alias="ratingTeamplay")

    # Time Stats
    toi: int = Field(alias="toi")  # Time on ice (minutes)
    toi_seconds: int = Field(alias="toiseconds")  # Time on ice in seconds

    # Skater Stats
    skassists: int  # Assists
    skbs: int  # Blocked shots
    skdeflections: int  # Deflections
    skfol: int  # Faceoffs lost
    skfopct: float  # Faceoff percentage
    skfow: int  # Faceoffs won
    skgiveaways: int  # Giveaways
    skgoals: int  # Goals
    skgwg: int  # Game winning goals
    skhits: int  # Hits
    skinterceptions: int  # Interceptions
    skpassattempts: int  # Pass attempts
    skpasses: int  # Completed passes
    skpasspct: float  # Pass completion percentage
    skpenaltiesdrawn: int  # Penalties drawn
    skpim: int  # Penalty minutes
    skpkclearzone: int  # Penalty kill clear zone
    skplusmin: int  # Plus/minus
    skpossession: int  # Time in possession (seconds)
    skppg: int  # Power play goals
    sksaucerpasses: int  # Saucer passes
    skshg: int  # Short handed goals
    skshotattempts: int  # Shot attempts
    skshotonnetpct: float  # Shots on net percentage
    skshotpct: float  # Shooting percentage
    skshots: int  # Shots on goal
    sktakeaways: int  # Takeaways

    # Goalie Stats
    glbrksavepct: float  # Breakaway save percentage
    glbrksaves: int  # Breakaway saves
    glbrkshots: int  # Breakaway shots faced
    gldsaves: int  # Desperation saves
    glga: int  # Goals against
    glgaa: float  # Goals against average
    glpensavepct: float  # Penalty shot save percentage
    glpensaves: int  # Penalty shot saves
    glpenshots: int  # Penalty shots faced
    glpkclearzone: int  # Penalty kill clear zone
    glpokechecks: int  # Poke checks
    glsavepct: float  # Save percentage
    glsaves: int  # Total saves
    glshots: int  # Total shots faced
    glsoperiods: int  # Shutout periods

    # Field validators for string-to-numeric conversion
    @field_validator(
        "player_level",
        "pos_sorted",
        "player_level_display",
        "is_guest",
        "player_dnf",
        "team_id",
        "team_side",
        "opponent_team_id",
        "opponent_score",
        "score",
        "toi",
        "toi_seconds",
        "skassists",
        "skbs",
        "skdeflections",
        "skfol",
        "skfow",
        "skgiveaways",
        "skgoals",
        "skgwg",
        "skhits",
        "skinterceptions",
        "skpassattempts",
        "skpasses",
        "skpenaltiesdrawn",
        "skpim",
        "skpkclearzone",
        "skplusmin",
        "skpossession",
        "skppg",
        "sksaucerpasses",
        "skshg",
        "skshotattempts",
        "skshots",
        "sktakeaways",
        "glbrksaves",
        "glbrkshots",
        "gldsaves",
        "glga",
        "glpensaves",
        "glpenshots",
        "glpkclearzone",
        "glpokechecks",
        "glsaves",
        "glshots",
        "glsoperiods",
        mode="before",
    )
    @classmethod
    def convert_to_int(cls, v):
        """Convert string values to integers."""
        return int(v) if isinstance(v, str) else v

    @field_validator(
        "rating_defense",
        "rating_offense",
        "rating_teamplay",
        "skfopct",
        "skpasspct",
        "skshotonnetpct",
        "skshotpct",
        "glbrksavepct",
        "glgaa",
        "glpensavepct",
        "glsavepct",
        mode="before",
    )
    @classmethod
    def convert_to_float(cls, v):
        """Convert string values to floats."""
        return float(v) if isinstance(v, str) else v

    # Computed properties
    @computed_field
    @property
    def points(self) -> int:
        """Total points (goals + assists)."""
        return self.skgoals + self.skassists

    @computed_field
    @property
    def faceoffs_total(self) -> int:
        """Total faceoffs taken."""
        return self.skfow + self.skfol

    @computed_field
    @property
    def faceoff_percentage(self) -> Optional[float]:
        """Faceoff win percentage.

        Returns:
            float: Percentage of faceoffs won (0-100)
            None: If no faceoffs were taken
        """
        total = self.faceoffs_total
        if total == 0:
            return None
        return round((self.skfow / total) * 100, 2)

    @computed_field
    @property
    def shots_missed(self) -> int:
        """Number of missed shots."""
        return max(0, self.skshotattempts - self.skshots)  # Ensure non-negative

    @computed_field
    @property
    def shooting_percentage(self) -> Optional[float]:
        """Shooting percentage (goals/shots).

        Returns:
            float: Percentage of shots that were goals (0-100)
            None: If no shots were taken
        """
        if self.skshots == 0:
            return None
        return round((self.skgoals / self.skshots) * 100, 2)

    @computed_field
    @property
    def passes_missed(self) -> int:
        """Number of incomplete passes."""
        return max(0, self.skpassattempts - self.skpasses)  # Ensure non-negative

    @computed_field
    @property
    def passing_percentage(self) -> Optional[float]:
        """Pass completion percentage.

        Returns:
            float: Percentage of passes completed (0-100)
            None: If no passes were attempted
        """
        if self.skpassattempts == 0:
            return None
        return round((self.skpasses / self.skpassattempts) * 100, 2)

    @computed_field
    @property
    def goals_saved(self) -> Optional[int]:
        """Total number of goals saved (goalie only).

        Returns:
            int: Number of saves if player is a goalie
            None: If player is not a goalie
        """
        if self.position != "goalie":
            return None
        return max(0, self.glshots - self.glga)  # Ensure non-negative

    @computed_field
    @property
    def save_percentage(self) -> Optional[float]:
        """Save percentage for goalies.

        Returns:
            float: Percentage of shots saved (0-100)
            None: If not a goalie or no shots faced
        """
        if self.position != "goalie" or self.glshots == 0:
            return None
        return round((self.glsaves / self.glshots) * 100, 2)

    @computed_field
    @property
    def major_penalties(self) -> int:
        """Number of major penalties (5 minutes each)."""
        return self.skpim // 5

    @computed_field
    @property
    def minor_penalties(self) -> int:
        """Number of minor penalties (2 minutes each)."""
        return (self.skpim % 5) // 2

    @computed_field
    @property
    def total_penalties(self) -> int:
        """Total number of penalties taken."""
        return self.major_penalties + self.minor_penalties

    @computed_field
    @property
    def points_per_60(self) -> float:
        """Points per 60 minutes of ice time."""
        return round((self.points * 60) / self.toi, 2) if self.toi > 0 else 0.0

    @computed_field
    @property
    def possession_per_minute(self) -> float:
        """Time in possession per minute of ice time."""
        return round(self.skpossession / self.toi, 2) if self.toi > 0 else 0.0

    @computed_field
    @property
    def shot_efficiency(self) -> Optional[float]:
        """Shooting efficiency considering all shot attempts.
        
        More punishing than regular shooting percentage as it includes missed shots.

        Returns:
            float: Percentage of shot attempts that were goals (0-100)
            None: If no shot attempts
        """
        if self.skshotattempts == 0:
            return None
        return round((self.skgoals / self.skshotattempts) * 100, 2)

    @computed_field
    @property
    def takeaway_giveaway_ratio(self) -> Optional[float]:
        """Ratio of takeaways to giveaways.

        Returns:
            float: Ratio of takeaways to giveaways (> 1 is good)
            None: If no giveaways
        """
        if self.skgiveaways == 0:
            return None
        return round(self.sktakeaways / self.skgiveaways, 2)

    @computed_field
    @property
    def penalty_differential(self) -> int:
        """Net penalties (drawn - taken)."""
        return self.skpenaltiesdrawn - self.total_penalties

    @computed_field
    @property
    def defensive_actions_per_minute(self) -> float:
        """Number of defensive actions (hits, blocks, takeaways) per minute.
        
        Useful for comparing defensive activity level regardless of TOI.
        """
        if self.toi == 0:
            return 0.0
        actions = self.skhits + self.skbs + self.sktakeaways
        return round(actions / self.toi, 2)

    @computed_field
    @property
    def offensive_impact(self) -> float:
        """Offensive impact per minute considering goals, assists, and shots.
        
        Useful for comparing offensive contribution regardless of TOI.
        """
        if self.toi == 0:
            return 0.0
        impact = (self.skgoals * 2) + self.skassists + (self.skshots * 0.5)
        return round(impact / self.toi, 2)

    @computed_field
    @property
    def defensive_impact(self) -> float:
        """Defensive impact per minute.
        
        Positive actions (hits, blocks, takeaways) minus negative (giveaways).
        """
        if self.toi == 0:
            return 0.0
        impact = (self.skhits + self.skbs + self.sktakeaways) - self.skgiveaways
        return round(impact / self.toi, 2)

    @computed_field
    @property
    def detailed_position(self) -> str:
        """Normalized position names for easier frontend consumption
        
        Returns a more specific position description, especially for defensemen
        where it differentiates between right and left defense based on pos_sorted.
        """
        if self.position == "defenseMen":
            return "rightDefense" if self.pos_sorted == 1 else "leftDefense"
        return self.position
    
    @computed_field
    @property
    def position_abbreviation(self) -> str:
        """Returns the position abbreviation for the player"""
        if self.position == "defenseMen":
            return "RD" if self.pos_sorted == 1 else "LD"
        elif self.position == "leftWing":
            return "LW"
        elif self.position == "rightWing":
            return "RW"
        elif self.position == "center":
            return "C"
        elif self.position == "goalie":
            return "G"
        
    @computed_field
    @property
    def game_impact_score(self) -> float:
        """Player's overall game impact on a 0-10 scale.
        
        Evaluates player performance using position-specific metrics:
        - 0-3: Below average performance
        - 4-6: Average performance
        - 7-8: Strong performance 
        - 9-10: Elite/exceptional performance
        
        Each position is scored on metrics most relevant to their role.
        """
        # Determine which position-specific method to call
        if self.position == "goalie":
            return self.goalie_game_impact
        elif self.position == "center":
            return self.center_game_impact
        elif self.position in ["leftWing", "rightWing"]:
            return self.winger_game_impact
        elif self.position == "defenseMen":
            return self.defense_game_impact
        else:
            # Fallback for unknown positions
            return 5.0

    @property
    def goalie_game_impact(self) -> float:
        """Calculate goalie's game impact score (0-10 scale).
        
        Considers:
        - Save percentage (primary factor)
        - High-danger saves (breakaways, penalty shots)
        - Shutout periods
        - Shot volume faced
        - Goals against (with context)
        """
        # Start with a base score of 5 (average)
        base_score = 5.0
        
        # Save percentage component (most important factor)
        # multiply by 100 to convert to percentage (0.xx to xx, 1.00 to 100)
        save_pct = (self.glsavepct * 100) if self.glsavepct is not None else 0
        
        # Perfect game bonus - if saved all shots and faced at least 1
        if save_pct == 100 and self.glshots > 0:
            # Perfect games get a big bonus based on shot volume
            if self.glshots >= 15:  # High volume perfect game
                perfect_bonus = 5.0  # Takes them to 10
            elif self.glshots >= 10:  # Medium-high volume perfect game
                perfect_bonus = 4.5  # Takes them to 9.5
            elif self.glshots >= 5:   # Medium volume perfect game
                perfect_bonus = 4.0   # Takes them to 9.0
            else:  # Low volume perfect game
                perfect_bonus = 3.0   # Takes them to 8.0
                
            base_score += perfect_bonus
        else:
            # For non-perfect games, scale based on save percentage using game standards
            if save_pct >= 90:
                save_bonus = 4.0 + ((save_pct - 90) / 10)  # 90% -> +4, 100% -> +5 (crazy good)
            elif save_pct >= 80:
                save_bonus = 2.5 + ((save_pct - 80) / 10) * 1.5  # 80% -> +2.5, 90% -> +4 (very good)
            elif save_pct >= 76:
                save_bonus = 1.5 + ((save_pct - 76) / 4) * 1.0  # 76% -> +1.5, 80% -> +2.5 (good)
            elif save_pct >= 70:
                save_bonus = 0.5 + ((save_pct - 70) / 6) * 1.0  # 70% -> +0.5, 76% -> +1.5 (decent)
            elif save_pct >= 60:
                save_bonus = -1.0 + ((save_pct - 60) / 10) * 1.5  # 60% -> -1, 70% -> +0.5 (bad)
            else:
                save_bonus = -2.5  # Under 60% is horrible
                
            # Apply shot volume modifier to the save bonus
            if self.glshots >= 20:  # High volume
                volume_modifier = 1.2
            elif self.glshots >= 10:  # Medium volume
                volume_modifier = 1.0
            elif self.glshots >= 5:  # Low-medium volume
                volume_modifier = 0.8
            else:  # Very low volume
                volume_modifier = 0.6
                
            base_score += save_bonus * volume_modifier
        
        # Shutout bonus (important achievement)
        if self.glga == 0 and self.glshots > 0:
            if self.glshots >= 15:
                shutout_bonus = 1.0
            elif self.glshots >= 8:
                shutout_bonus = 0.7
            else:
                shutout_bonus = 0.5
            
            base_score += shutout_bonus
        
        # Special saves bonus (breakaways, penalty shots, desperation saves)
        special_saves = self.glbrksaves + self.glpensaves + self.gldsaves
        if special_saves > 0:
            # Each special save is worth up to 0.3 points, max 1.5 points
            special_bonus = min(1.5, special_saves * 0.3)
            base_score += special_bonus
        
        # Pokechecks bonus (active goaltending)
        if self.glpokechecks > 0:
            pokecheck_bonus = min(0.5, self.glpokechecks * 0.2)
            base_score += pokecheck_bonus
        
        # Goals against penalty - be generous because it's already factored into save %
        # Only apply for higher shot volumes to avoid double-penalizing
        if self.glshots >= 10:
            # Expected goals based on shot volume (roughly 15-20% in this game)
            expected_goals = self.glshots * 0.175
            excess_goals = max(0, self.glga - expected_goals)
            
            # Penalty is up to -1.5 for significantly exceeding expected goals
            goals_penalty = min(1.5, excess_goals * 0.4)
            base_score -= goals_penalty
        
        # Make sure score is between 0-10
        final_score = max(0, min(10, base_score))
        
        # Return rounded score to one decimal place
        return round(final_score, 1)

    @property
    def center_game_impact(self) -> float:
        """Calculate center's game impact score (0-10 scale).
        
        Emphasizes:
        - Faceoff performance
        - Two-way play
        - Playmaking
        - Scoring
        """
        # Faceoff component (0-2 points)
        if self.faceoffs_total > 5:  # Only relevant if took enough faceoffs
            faceoff_pct = self.faceoff_percentage if self.faceoff_percentage else 0
            faceoff_component = min(2.0, (faceoff_pct / 100) * 4)
        else:
            faceoff_component = 1.0  # Neutral if not enough faceoffs
        
        # Offensive component (0-3 points)
        # Goals are worth more, assists secondary
        goal_value = self.skgoals * 1.0
        assist_value = self.skassists * 0.5
        shot_value = self.skshots * 0.1
        
        # Heavier adjustment for TOI to compare fairly
        offense_per_20 = (goal_value + assist_value + shot_value) * (20 / max(1, self.toi))
        offensive_component = min(3.0, offense_per_20)
        
        # Defensive component (0-2.5 points)
        defensive_value = (
            (self.skbs * 0.3) + 
            (self.sktakeaways * 0.4) + 
            (self.skinterceptions * 0.3) - 
            (self.skgiveaways * 0.3)
        )
        defensive_per_20 = defensive_value * (20 / max(1, self.toi))
        defensive_component = min(2.5, max(0, 1.0 + (defensive_per_20 / 4)))
        
        # Playmaking component (0-1.5 points)
        if self.skpassattempts > 5:  # Only relevant if attempted enough passes
            passing_component = min(1.5, (self.skpasses / max(1, self.skpassattempts)) * 1.5)
        else:
            passing_component = 0.75  # Neutral if not enough passes
        
        # Special teams contribution (0-1 point)
        special_teams = min(1.0, (self.skppg * 0.5) + (self.skshg * 0.7) + (self.skpkclearzone * 0.2))
        
        # Final score calculation with baseline of 4 for an average performance
        base_score = faceoff_component + offensive_component + defensive_component + passing_component + special_teams
        
        # Normalize to 0-10 scale
        normalized_score = min(10, base_score)
        
        return round(normalized_score, 1)

    @property
    def winger_game_impact(self) -> float:
        """Calculate winger's game impact score (0-10 scale).
        
        Emphasizes:
        - Scoring
        - Zone time/possession
        - Physical play
        - Plus/minus
        - Special teams
        """
        # Scoring component (0-4.5 points) - main job of wingers
        goal_value = self.skgoals * 1.5  # Increase goal weight
        assist_value = self.skassists * 0.8  # Increase assist weight
        shot_value = self.skshots * 0.1
        
        # For exceptional performances, reduce TOI adjustment factor
        # This prevents high-production games from being undervalued
        production_factor = goal_value + assist_value
        toi_factor = 20 / max(1, min(self.toi, 50))  # Cap TOI factor for high-minute games
        
        # Scale TOI adjustment down for high-production games
        if production_factor > 4:
            toi_factor = min(toi_factor, 1.2)  # Don't overly adjust high-production games
        
        scoring_per_20 = (goal_value + assist_value + shot_value) * toi_factor
        scoring_component = min(4.5, scoring_per_20)  # Higher cap for exceptional performances
        
        # Possession component (0-2 points)
        possession_per_minute = self.skpossession / max(1, self.toi)
        possession_component = min(2.0, possession_per_minute / 10)  # Adjust divisor to be more generous
        
        # Physical play component (0-1.5 points)
        physical_value = (self.skhits * 0.2) + (self.skbs * 0.1)
        physical_per_20 = physical_value * toi_factor
        physical_component = min(1.5, physical_per_20)
        
        # Defensive component (0-1.5 points) - normalize giveaways by possession time
        # Expected giveaway rate: about 1 per 30 seconds of possession
        expected_giveaways = max(1, self.skpossession / 30)
        
        # Only penalize for excessive giveaways relative to possession time
        excess_giveaways = max(0, self.skgiveaways - expected_giveaways)
        
        defensive_value = (
            (self.sktakeaways * 0.4) + 
            (self.skinterceptions * 0.3) - 
            (excess_giveaways * 0.2)  # Reduced penalty for giveaways
        )
        defensive_per_20 = defensive_value * toi_factor
        defensive_component = min(1.5, max(0, defensive_per_20 + 0.5))  # Higher baseline
        
        # Plus/minus component (0-1 point) - wingers should be judged on this
        if self.toi >= 5:  # Only relevant with enough ice time
            plusminus_per_20 = self.skplusmin * toi_factor
            plusminus_component = min(1.0, max(0, 0.5 + (plusminus_per_20 / 4)))
        else:
            plusminus_component = 0.5  # Neutral with low ice time
        
        # Special teams contribution (0-1 point)
        special_teams = min(1.0, (self.skppg * 0.5) + (self.skshg * 0.7) + (self.skpkclearzone * 0.1))
        
        # Final score calculation
        base_score = (
            scoring_component + 
            possession_component + 
            physical_component + 
            defensive_component + 
            plusminus_component +
            special_teams
        )
        
        # Normalize to 0-10 scale
        normalized_score = min(10, base_score)
        
        return round(normalized_score, 1)

    @property
    def defense_game_impact(self) -> float:
        """Calculate defenseman's game impact score (0-10 scale).
        
        Emphasizes:
        - Defensive metrics
        - Outlet passing
        - Plus/minus
        - Physical presence
        """
        # Defensive component (0-4 points) - main job
        blocks_value = self.skbs * 0.4
        takeaways_value = self.sktakeaways * 0.3
        interceptions_value = self.skinterceptions * 0.2
        giveaways_penalty = self.skgiveaways * 0.3
        
        defensive_value = blocks_value + takeaways_value + interceptions_value - giveaways_penalty
        defensive_per_20 = defensive_value * (20 / max(1, self.toi))
        defensive_component = min(4.0, max(0, 2.0 + (defensive_per_20 / 4)))
        
        # Outlet passing component (0-2 points)
        if self.skpassattempts > 5:
            passing_component = min(2.0, (self.skpasses / max(1, self.skpassattempts)) * 2.0)
        else:
            passing_component = 1.0  # Neutral if not enough passes
        
        # Plus/minus component (0-1.5 points)
        if self.toi >= 5:  # Only relevant with enough ice time
            plusminus_per_20 = self.skplusmin * (20 / max(5, self.toi))
            plusminus_component = min(1.5, max(0, 0.75 + (plusminus_per_20 / 4)))
        else:
            plusminus_component = 0.75  # Neutral with low ice time
        
        # Physical component (0-1.5 points)
        hits_per_20 = self.skhits * (20 / max(1, self.toi))
        physical_component = min(1.5, hits_per_20 / 3)
        
        # Offensive contribution (0-1 point) - bonus, not primary job
        offensive_value = (self.skgoals * 0.7) + (self.skassists * 0.3) + (self.skshots * 0.05)
        offensive_per_20 = offensive_value * (20 / max(1, self.toi))
        offensive_component = min(1.0, offensive_per_20)
        
        # Final score calculation
        base_score = defensive_component + passing_component + plusminus_component + physical_component + offensive_component
        
        # Normalize to 0-10 scale
        normalized_score = min(10, base_score)
        
        return round(normalized_score, 1)
        
    @computed_field
    @property
    def puck_management_rating(self) -> float:
        """Rating of player's puck management ability (0-10 scale)
        
        Considers passing accuracy, takeaway/giveaway ratio, and interceptions.
        Higher values indicate better puck management.
        """
        pass_factor = self.passing_percentage or 0
        tg_ratio = 5 # Default value if no giveaways
        if self.skgiveaways > 0:
            tg_ratio = min(10, (self.sktakeaways / self.skgiveaways) * 5)
        
        interception_factor = min(5, self.skinterceptions * 0.5)

        # Average the factors and scale to 0-10
        raw_score = (pass_factor/10 + tg_ratio + interception_factor) / 3
        return round(min(10, raw_score), 1)
    
    @computed_field
    @property
    def posession_efficiency(self) -> float:
        """Points generated per minut of possesion time.
        
        Measures how effectively a player converts possession time into offensive output.
        """
        if self.skpossession == 0:
            return None
        return round((self.points * 60) / self.skpossession, 2)
    
    @computed_field
    @property
    def net_defensive_contribution(self) -> int:
       """Net defensive plays (blocks + takeaways + interceptions - giveaways).
       
       Positive values indicate strong defensive contribution.
       """
       return (
           self.skbs +
           self.sktakeaways +
           self.skinterceptions -
           self.skgiveaways
       )
       
    @computed_field
    @property
    def time_adjusted_rating(self) -> float:
       """Player rating adjusted for time on ice.
       
       Averages the player's rating categories and adjusts for TOI to compare
       players with different ice time more fairly.
       """
       avg_rating = (
           self.rating_defense +
           self.rating_offense +
           self.rating_teamplay
       ) / 3
       toi_factor = min(1.5, max(0.5, self.toi / 20))
       return round(avg_rating * toi_factor, 1)
   
    @computed_field
    @property
    def shot_generation_rate(self) -> float:
        """Shot attempts generated per minute of ice time"""
        if self.toi_seconds > 0:
            return round(self.skshotattempts * 60 / self.toi_seconds, 2)
        return 0.0
        
    @computed_field
    @property
    def offensive_zone_presence(self) -> float:
        """Offensive zone presence score based on shots, passes, and possession time
        
        Higher values indicate more offensive zone time and activity.
        """
        shot_factor = min(5, self.skshotattempts * 0.2)
        pass_factor = min(3, self.skpassattempts * 0.05)
        poss_factor = min(5, self.skpossession / 60)
        
        return round(shot_factor + pass_factor + poss_factor, 1)
    
    @computed_field
    @property
    def two_way_rating(self) -> float:
        """Combines offensive and defensive rating on a 0-10 scale
        
        Balances offensive production with defensive contributions.
        """
        off_value = (
            (self.points * 2) +
            (self.skshots * 0.3) +
            (self.skshotattempts * 0.1)
        )
        def_value = (
            (self.skbs * 0.7) +
            (self.sktakeaways * 0.8) +
            (self.skinterceptions * 0.6) -
            (self.skgiveaways * 0.5)
        )
        
        # Scale 0-10
        scaled_off = min(10, off_value / 2)
        scaled_def = min(10, (def_value + 5) / 2)
        
        return round((scaled_off + scaled_def) / 2, 1)