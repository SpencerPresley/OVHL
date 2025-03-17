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
        - Playmaking and team offense generation
        - Faceoff performance with appropriate weighting
        - Puck management and possession
        - Two-way play
        - Game context and situation
        
        Scale:
        - 0-3: Below average performance
        - 4-6: Average performance
        - 7-8: Strong performance
        - 9-10: Elite/exceptional performance
        """
        # ===== FACEOFF COMPONENT (0-1.5 points) =====
        # Slightly reduced from 0-2 points to avoid overpenalizing
        if self.faceoffs_total > 5:
            faceoff_pct = self.faceoff_percentage if self.faceoff_percentage else 0
            # More generous curve - 50% gets 1.0 points
            faceoff_component = min(1.5, 0.5 + (faceoff_pct / 100) * 2)
        else:
            faceoff_component = 0.75  # Neutral if not enough faceoffs
        
        # ===== PLAYMAKING/OFFENSIVE COMPONENT (0-3.5 points) =====
        # Goals and assists with team context
        goal_value = self.skgoals * 1.2
        assist_value = self.skassists * 0.7  # Higher value for assists
        shot_value = self.skshots * 0.1
        
        # Team contribution bonus - centers should drive offense
        team_contribution = 0.0
        if self.points > 0 and self.score > 0:
            contribution_pct = min(100, (self.points / max(1, self.score)) * 100)
            if contribution_pct >= 75:  # Contributed to 75%+ of team's offense
                team_contribution = 1.0
            elif contribution_pct >= 50:  # Contributed to 50%+ of team's offense
                team_contribution = 0.7
            elif contribution_pct >= 30:  # Contributed to 30%+ of team's offense
                team_contribution = 0.4
        
        # Per-minute adjustment for fair comparison
        offense_per_20 = (goal_value + assist_value + shot_value) * (20 / max(1, self.toi))
        offensive_component = min(3.5, offense_per_20 + team_contribution)
        
        # ===== PUCK MANAGEMENT COMPONENT (0-2 points) =====
        # Centers need exceptional puck management
        # Use existing puck_management_rating (0-10 scale)
        puck_mgmt_component = min(2.0, self.puck_management_rating / 5)
        
        # ===== DEFENSIVE COMPONENT (0-2 points) =====
        # Use net_defensive_contribution but with appropriate scaling
        if self.net_defensive_contribution >= 10:  # Excellent
            defensive_component = 2.0
        elif self.net_defensive_contribution >= 5:  # Very good
            defensive_component = 1.7
        elif self.net_defensive_contribution >= 0:  # Good
            defensive_component = 1.4
        elif self.net_defensive_contribution >= -5:  # Average
            defensive_component = 1.0
        elif self.net_defensive_contribution >= -10:  # Below average
            defensive_component = 0.6
        else:  # Poor
            defensive_component = 0.3
        
        # ===== PLUS/MINUS COMPONENT (0-1 point) =====
        if self.toi >= 5:
            if self.skplusmin >= 3:  # Excellent
                plusminus_component = 1.0
            elif self.skplusmin >= 1:  # Good
                plusminus_component = 0.8
            elif self.skplusmin == 0:  # Neutral
                plusminus_component = 0.5
            elif self.skplusmin >= -2:  # Slightly negative
                plusminus_component = 0.3
            else:  # Poor
                plusminus_component = 0.1
        else:
            plusminus_component = 0.5  # Neutral with low ice time
        
        # ===== SPECIAL TEAMS COMPONENT (0-1 point) =====
        special_teams = min(1.0, (self.skppg * 0.5) + (self.skshg * 0.7) + (self.skpkclearzone * 0.2))
        
        # ===== GAME CONTEXT ADJUSTMENT =====
        # Score adjustment for meaningful performance in close games
        score_diff = abs(self.score - self.opponent_score)
        win_bonus = 0.3 if (self.team_side == 0 and self.score > self.opponent_score) or \
                        (self.team_side == 1 and self.opponent_score > self.score) else 0
        
        if score_diff <= 1:  # Very close game
            context_adjustment = 0.4 + win_bonus
        elif score_diff <= 2:  # Fairly close game
            context_adjustment = 0.2 + win_bonus
        else:
            context_adjustment = win_bonus
        
        # ===== FINAL CALCULATION =====
        base_score = (
            faceoff_component + 
            offensive_component + 
            puck_mgmt_component + 
            defensive_component + 
            plusminus_component + 
            special_teams
        )
        
        final_score = base_score + context_adjustment
        
        # Normalize to 0-10 scale
        normalized_score = min(10, final_score)
        
        return round(normalized_score, 1)

    @property
    def winger_game_impact(self) -> float:
        """Calculate winger's game impact score (0-10 scale).
        
        Emphasizes:
        - Scoring (goals, multi-goal performances, GWGs)
        - Zone time/possession
        - Physical play
        - Plus/minus
        - Special teams
        - Shooting efficiency
        
        Scale:
        - 0-3: Below average performance
        - 4-6: Average performance
        - 7-8: Strong performance
        - 9-10: Elite/exceptional performance (hat tricks, 4+ point games)
        """
        # ===== SCORING COMPONENT (0-5.5 points) =====
        # Base values for offensive contributions
        goal_value = self.skgoals * 1.8  # Higher weight for goals
        assist_value = self.skassists * 0.9  # Higher weight for assists
        shot_value = self.skshots * 0.08
        
        # Multi-goal bonuses (hat tricks and braces)
        if self.skgoals >= 3:  # Hat trick
            multi_goal_bonus = 1.5  # Significant bonus for hat tricks
        elif self.skgoals == 2:  # Brace
            multi_goal_bonus = 0.7  # Bonus for two-goal games
        else:
            multi_goal_bonus = 0.0
        
        # Game-winning goal bonus
        gwg_bonus = 0.8 if self.skgwg >= 1 else 0.0
        
        # Team contribution factor - how much of team's offense did player generate?
        # Only count if player contributed meaningfully
        team_contribution = 0.0
        if self.points >= 2 and self.score > 0:
            # Calculate what percentage of team goals the player contributed to
            contribution_pct = min(100, (self.points / max(1, self.score)) * 100)
            if contribution_pct >= 75:  # Contributed to 75%+ of team's offense
                team_contribution = 1.0
            elif contribution_pct >= 50:  # Contributed to 50%+ of team's offense
                team_contribution = 0.6
            elif contribution_pct >= 33:  # Contributed to 33%+ of team's offense
                team_contribution = 0.3
        
        # For exceptional performances, adjust TOI factor less aggressively
        production_factor = goal_value + assist_value
        
        # Shooting efficiency bonus (rewards efficient scoring)
        shooting_bonus = 0.0
        if self.skgoals >= 2 and self.shooting_percentage and self.shooting_percentage > 25:
            shooting_bonus = 0.5  # Bonus for efficient scoring (>25% shooting with multiple goals)
        
        # Calculate raw offensive value before TOI adjustment
        raw_offensive_value = goal_value + assist_value + shot_value + multi_goal_bonus + gwg_bonus + team_contribution + shooting_bonus
        
        # Apply TOI adjustment but with protection for exceptional performances
        if raw_offensive_value > 5:  # Exceptional offensive game
            toi_factor = min(1.0, max(0.9, 20 / max(1, self.toi)))  # Minimal TOI adjustment for star performances
        else:
            toi_factor = 20 / max(1, min(self.toi, 45))  # Normal TOI adjustment
            
        # Apply TOI adjustment
        offensive_value = raw_offensive_value * toi_factor
        
        # Cap offensive component but allow exceptional performances to score higher
        if self.skgoals >= 3 or self.points >= 5:
            scoring_component = min(5.5, offensive_value)  # Higher cap for truly exceptional games
        else:
            scoring_component = min(4.5, offensive_value)
            
        # ===== POSSESSION COMPONENT (0-1.5 points) =====
        possession_per_minute = self.skpossession / max(1, self.toi)
        possession_component = min(1.5, possession_per_minute / 9)  # Slightly more generous
        
        # ===== PHYSICAL COMPONENT (0-1.5 points) =====
        physical_value = (self.skhits * 0.25) + (self.skbs * 0.15)
        physical_per_20 = physical_value * toi_factor
        physical_component = min(1.5, physical_per_20)
        
        # ===== DEFENSIVE COMPONENT (0-1.5 points) =====
        # Expected giveaway rate based on possession time (1 per 25 seconds)
        expected_giveaways = max(2, self.skpossession / 25)
        
        # Only penalize for excess giveaways relative to possession time
        excess_giveaways = max(0, self.skgiveaways - expected_giveaways)
        
        # Scale down defensive penalties for high-scoring performances
        defensive_penalty_factor = 1.0
        if self.skgoals >= 2 or self.points >= 3:
            defensive_penalty_factor = 0.5  # Reduce defensive penalties for offensive stars
            
        defensive_value = (
            (self.sktakeaways * 0.5) + 
            (self.skinterceptions * 0.3) - 
            (excess_giveaways * 0.15 * defensive_penalty_factor)  # Lower penalty for giveaways
        )
        
        defensive_per_20 = defensive_value * toi_factor
        
        # Set higher baseline for defensive component
        defensive_component = min(1.5, max(0, defensive_per_20 + 0.6))
        
        # ===== PLUS/MINUS COMPONENT (0-1.5 points) =====
        # Plus/minus is more important for wingers - it shows if they're on ice for goals
        if self.toi >= 5:
            if self.skplusmin >= 3:  # Excellent plus/minus
                plusminus_component = 1.5
            elif self.skplusmin >= 1:  # Good plus/minus
                plusminus_component = 1.0
            elif self.skplusmin == 0:  # Neutral
                plusminus_component = 0.75
            elif self.skplusmin >= -2:  # Slightly negative
                plusminus_component = 0.5
            else:  # Poor plus/minus
                plusminus_component = 0.25
        else:
            plusminus_component = 0.75  # Default for low TOI
            
        # ===== SPECIAL TEAMS COMPONENT (0-1 point) =====
        special_teams = min(1.0, (self.skppg * 0.6) + (self.skshg * 0.8) + (self.skpkclearzone * 0.2))
        
        # ===== FINAL CALCULATION =====
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
        
        Comprehensive evaluation using multiple metrics:
        - Puck management (passing, takeaways/giveaways)
        - EA Sports' defensive rating
        - Defensive contributions and impact
        - Outlet passing and zone generation
        - Special teams and penalty discipline
        - Game context and plus/minus
        
        Scale:
        - 0-3: Below average performance
        - 4-6: Average performance
        - 7-8: Strong performance
        - 9-10: Elite/exceptional performance
        """
        # ===== PUCK MANAGEMENT COMPONENT (0-2 points) =====
        # Use our existing puck_management_rating (already scaled 0-10)
        puck_mgmt_component = self.puck_management_rating / 5  # Scale to 0-2
        
        # ===== EA DEFENSIVE RATING COMPONENT (0-1.5 points) =====
        # Use EA's own defensive rating for the player (0-100 scale)
        ea_defense_component = min(1.5, self.rating_defense / 67)
        
        # ===== DEFENSIVE ACTIONS COMPONENT (0-2.5 points) =====
        # Use net_defensive_contribution but normalize it
        # Average D-men might have -5 to +5 net contribution
        if self.net_defensive_contribution >= 5:  # Excellent
            def_contribution_component = 2.5
        elif self.net_defensive_contribution >= 0:  # Good
            def_contribution_component = 1.75 + (self.net_defensive_contribution / 20)
        elif self.net_defensive_contribution >= -10:  # Average to below average
            def_contribution_component = 1.25 + (self.net_defensive_contribution / 40)
        else:  # Poor
            def_contribution_component = max(0.5, 1.25 + (self.net_defensive_contribution / 40))
        
        # ===== PASSING & ZONE EXIT COMPONENT (0-1.5 points) =====
        # High quality passes are vital for defensemen
        if self.skpassattempts > 5:
            # Award up to 1.5 points based on passing percentage and volume
            pass_quality = self.passing_percentage / 100 if self.passing_percentage else 0.5
            pass_volume = min(1, self.skpassattempts / 20)  # Normalize pass attempts
            passing_component = 1.5 * pass_quality * pass_volume
        else:
            passing_component = 0.75  # Neutral if not enough passes
        
        # ===== PLUS/MINUS COMPONENT (0-1.5 points) =====
        # Tiered approach based on actual values
        if self.toi >= 5:
            if self.skplusmin >= 3:  # Excellent
                plusminus_component = 1.5
            elif self.skplusmin >= 1:  # Good
                plusminus_component = 1.2
            elif self.skplusmin == 0:  # Neutral
                plusminus_component = 0.75
            elif self.skplusmin >= -2:  # Slightly negative
                plusminus_component = 0.5
            else:  # Poor
                plusminus_component = 0.25
        else:
            plusminus_component = 0.75  # Neutral with low ice time
        
        # ===== PHYSICAL PLAY COMPONENT (0-1 point) =====
        # Use defensive_actions_per_minute which includes hits
        physical_component = min(1.0, self.defensive_actions_per_minute / 0.5)
        
        # ===== OFFENSIVE CONTRIBUTION (0-1.5 points) =====
        # For defensemen, this is a bonus but still important
        if self.points >= 3:  # Exceptional offensive game
            offensive_component = 1.5
        elif self.points >= 2:  # Strong offensive game
            offensive_component = 1.2
        elif self.points == 1:  # Average contribution
            offensive_component = 0.8
        else:  # No points
            # Still give some credit for shots and possession
            shots_component = min(0.5, (self.skshots * 0.1) + (self.skshotattempts * 0.05))
            offensive_component = shots_component
        
        # ===== PENALTY DISCIPLINE COMPONENT (-0.5 to 0.5) =====
        # Reward drawing penalties, penalize taking them
        penalty_component = min(0.5, max(-0.5, self.penalty_differential * 0.25))
        
        # ===== SPECIAL TEAMS COMPONENT (0-0.5 points) =====
        special_teams = min(0.5, (self.skpkclearzone * 0.25) + (self.skppg * 0.3) + (self.skshg * 0.5))
        
        # ===== FINAL CALCULATION =====
        base_score = (
            puck_mgmt_component +
            ea_defense_component + 
            def_contribution_component + 
            passing_component + 
            plusminus_component + 
            physical_component + 
            offensive_component +
            special_teams +
            penalty_component
        )
        
        # ===== GAME CONTEXT ADJUSTMENT =====
        # Score adjustment for meaningful defensive performance in close games
        score_diff = abs(self.score - self.opponent_score)
        win_bonus = 0.3 if (self.team_side == 0 and self.score > self.opponent_score) or \
                        (self.team_side == 1 and self.opponent_score > self.score) else 0
        
        if score_diff <= 1 and self.skplusmin > 0:  # Strong defensive game in a close match
            context_adjustment = 0.5 + win_bonus
        elif score_diff <= 2 and self.skplusmin > 0:  # Good defensive game in a fairly close match
            context_adjustment = 0.3 + win_bonus
        else:
            context_adjustment = win_bonus
        
        final_score = base_score + context_adjustment
        
        # Normalize to 0-10 scale
        normalized_score = min(10, final_score)
        
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