import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple

class HockeyWAR:
    """
    Hockey Wins Above Replacement Calculator
    
    Calculates WAR values for hockey players using position-specific formulas
    and contextual adjustments to provide a comprehensive value metric.
    """
    
    def __init__(self, csv_path: str):
        """Initialize with the path to player data CSV."""
        self.df = pd.read_csv(csv_path)
        self.position_groups = ['center', 'leftWing', 'rightWing', 'leftDefense', 'rightDefense', 'goalie']
        self.replacement_level = {}
        self.war_components = {}
        self.player_war = None
        
        # Define metrics that contribute to WAR by position and component
        # Revised to use more established metrics instead of the custom ones
        self.offensive_metrics = {
            'skater': [
                'points_per_60',         # Points per 60 minutes
                'skgoals',               # Goals
                'skassists',             # Assists
                'skshots',               # Shots on goal
                'skshotattempts',        # Shot attempts
                'shot_generation_rate',  # Shots attempted per minute
                'shot_efficiency',       # Goals per shot attempt
            ],
            'goalie': []  # Goalies don't have offensive metrics
        }
        
        self.defensive_metrics = {
            'skater': [
                'skbs',               # Blocked shots
                'sktakeaways',        # Takeaways
                'skhits',             # Hits
                'skinterceptions',    # Interceptions
                'skplusmin',          # Plus/minus
                'defensive_actions_per_minute',  # Defensive actions per minute
            ],
            'goalie': [
                'save_percentage',    # Save percentage
                'glsavepct',          # Game save percentage
                'glgaa',              # Goals against average (inverse relationship)
                'goals_saved',        # Total goals saved
                'glbrksaves',         # Breakaway saves
                'gldsaves',           # Desperation saves
            ]
        }
        
        self.teamplay_metrics = {
            'skater': [
                'passing_percentage',    # Pass completion percentage
                'skpasspct',             # In-game pass percentage
                'skpasses',              # Completed passes
                'puck_management_rating', # Puck management rating
                'skpenaltiesdrawn',      # Penalties drawn
                'penalty_differential',  # Penalties drawn minus taken
            ],
            'goalie': [
                'glpkclearzone',         # Penalty kill clear zone
                'glpokechecks',          # Poke checks
            ]
        }
        
        # Define position-specific weights
        self.position_weights = {
            'center': {
                'offensive': 0.45,
                'defensive': 0.35,
                'teamplay': 0.20,
            },
            'leftWing': {
                'offensive': 0.55,
                'defensive': 0.25,
                'teamplay': 0.20,
            },
            'rightWing': {
                'offensive': 0.55,
                'defensive': 0.25,
                'teamplay': 0.20,
            },
            'leftDefense': {
                'offensive': 0.25,
                'defensive': 0.55,
                'teamplay': 0.20,
            },
            'rightDefense': {
                'offensive': 0.25,
                'defensive': 0.55,
                'teamplay': 0.20,
            },
            'goalie': {
                'offensive': 0.0,
                'defensive': 0.85,
                'teamplay': 0.15,
            }
        }
        
        # Win conversion factors (how much WAR = 1 win)
        # Adjusted to balance skater and goalie impact better
        self.win_conversion = {
            'skater': 6.0,  # 6 skater WAR points = 1 team win
            'goalie': 20.0  # 20 goalie WAR points = 1 team win - increased to reduce goalie dominance
        }
        
    def preprocess_data(self) -> None:
        """Clean and prepare data for WAR calculations."""
        # Create all derived columns upfront to avoid fragmentation
        # Initialize all columns we'll use in one go
        new_columns = {
            'position_category': 'skater',
            'game_impact_norm': 0.0,
            'glgaa_normalized': 0.0,
            'offensive_war': 0.0,
            'defensive_war': 0.0,
            'teamplay_war': 0.0,
            'raw_war': 0.0,
            'context_adjustment': 0.0,
            'impact_factor': 1.0,
            'adjusted_war': 0.0,
            'war_value': 0.0
        }
        
        # Add all columns at once to prevent fragmentation
        for col, default in new_columns.items():
            if col not in self.df.columns:
                self.df[col] = default
                
        # Create a fresh copy to defragment
        self.df = self.df.copy()
        
        # Fill NaN values appropriately
        numeric_cols = self.df.select_dtypes(include=['float64', 'int64']).columns
        for col in numeric_cols:
            # Use 0 for most metrics if missing
            self.df[col] = self.df[col].fillna(0)
            
        # Create position category
        self.df['position_category'] = self.df['detailed_position'].apply(
            lambda x: 'goalie' if x == 'goalie' else 'skater'
        )
        
        # Handle special metrics that need preprocessing
        
        # For goalies, lower GAA is better, so invert it for WAR calculation
        if 'glgaa' in self.df.columns:
            # Normalize GAA (typical range 0-6) and invert
            self.df['glgaa_normalized'] = 1 - (self.df['glgaa'] / 6.0)
            self.df['glgaa_normalized'] = self.df['glgaa_normalized'].clip(0, 1)
            
        # Normalize game_impact_score to 0-1 range for later use
        self.df['game_impact_norm'] = self.df['game_impact_score'] / 10.0
        
        # Minimum games/TOI threshold for reliable stats
        # Group by player and count games
        player_games = self.df.groupby(['player_id', 'player_name', 'detailed_position']).size().reset_index(name='games_played')
        # Only include players with at least 3 games
        qualified_players = player_games[player_games['games_played'] >= 3]['player_id'].tolist()
        self.df_qualified = self.df[self.df['player_id'].isin(qualified_players)]
        
        print(f"Preprocessing complete. {len(qualified_players)} qualified players with 3+ games.")
        
    def establish_replacement_level(self) -> None:
        """
        Establish replacement level baselines for each position.
        
        Replacement level is defined as the 20th percentile performance within each position.
        """
        self.replacement_level = {}
        
        for position in self.position_groups:
            position_df = self.df[self.df['detailed_position'] == position]
            self.replacement_level[position] = {}
            
            # For each metric, calculate 20th percentile as replacement level
            metrics = self._get_position_metrics(position)
            for metric in metrics:
                if metric in position_df.columns:
                    # Use 20th percentile as replacement level
                    self.replacement_level[position][metric] = position_df[metric].quantile(0.2)
        
        print("Replacement levels established for all positions.")
    
    def _get_position_metrics(self, position: str) -> List[str]:
        """Get relevant metrics for a specific position."""
        category = 'goalie' if position == 'goalie' else 'skater'
        
        metrics = []
        metrics.extend(self.offensive_metrics[category])
        metrics.extend(self.defensive_metrics[category])
        metrics.extend(self.teamplay_metrics[category])
        
        return metrics
    
    def calculate_war_components(self) -> None:
        """Calculate offensive, defensive, and teamplay WAR components for each player-game."""
        # Components are initialized in preprocess_data now
        
        for position in self.position_groups:
            position_mask = self.df['detailed_position'] == position
            category = 'goalie' if position == 'goalie' else 'skater'
            
            # Calculate offensive component
            if category == 'skater':  # Only skaters have offensive component
                self._calculate_component(position, 'offensive', position_mask)
            
            # Calculate defensive component
            self._calculate_component(position, 'defensive', position_mask)
            
            # Calculate teamplay component
            self._calculate_component(position, 'teamplay', position_mask)
        
        print("WAR components calculated for all players.")
                
    def _calculate_component(self, position: str, component: str, mask: pd.Series) -> None:
        """Calculate a specific WAR component for players in a position."""
        category = 'goalie' if position == 'goalie' else 'skater'
        metrics = getattr(self, f"{component}_metrics")[category]
        
        if not metrics:
            return  # Skip if no metrics for this component (e.g., offensive for goalies)
        
        component_values = np.zeros(len(self.df))
        
        # Define metric weights based on importance
        # This helps balance metrics with different scales
        metric_weights = {}
        
        # Assign custom weights for different metrics based on their importance
        if component == 'offensive' and category == 'skater':
            metric_weights = {
                'points_per_60': 0.30,
                'skgoals': 0.25,
                'skassists': 0.15,
                'skshots': 0.10,
                'skshotattempts': 0.05,
                'shot_generation_rate': 0.10,
                'shot_efficiency': 0.05
            }
        elif component == 'defensive' and category == 'skater':
            metric_weights = {
                'skbs': 0.20,
                'sktakeaways': 0.25,
                'skhits': 0.15,
                'skinterceptions': 0.20,
                'skplusmin': 0.10,
                'defensive_actions_per_minute': 0.10
            }
        elif component == 'defensive' and category == 'goalie':
            metric_weights = {
                'save_percentage': 0.35,
                'glsavepct': 0.20,
                'glgaa_normalized': 0.20,  # Use the normalized version
                'goals_saved': 0.15,
                'glbrksaves': 0.05,
                'gldsaves': 0.05
            }
        elif component == 'teamplay' and category == 'skater':
            metric_weights = {
                'passing_percentage': 0.20,
                'skpasspct': 0.20,
                'skpasses': 0.15,
                'puck_management_rating': 0.25,
                'skpenaltiesdrawn': 0.10,
                'penalty_differential': 0.10
            }
        else:
            # Default to equal weighting if not specified
            for metric in metrics:
                metric_weights[metric] = 1.0 / len(metrics)
                
        # Normalize metric_weights to sum to 1
        total_weight = sum(weight for metric, weight in metric_weights.items() 
                          if metric in self.df.columns and metric in self.replacement_level[position])
        
        if total_weight > 0:
            for metric, weight in metric_weights.items():
                if metric in self.df.columns and metric in self.replacement_level[position]:
                    # Get replacement level
                    repl_level = self.replacement_level[position][metric]
                    
                    # Calculate value above replacement
                    above_repl = self.df[metric] - repl_level
                    
                    # Handle special case for goalies (GAA is inverted)
                    if metric == 'glgaa_normalized':
                        above_repl = self.df[metric] - self.replacement_level[position]['glgaa']
                    
                    # Scale metric based on typical range to make them comparable
                    # This ensures metrics with different scales contribute proportionally
                    # These scaling factors would ideally be determined by analyzing the data distribution
                    scaling_factor = self._get_metric_scaling(metric, position)
                    
                    # Add contribution from this metric, properly weighted and scaled
                    normalized_weight = weight / total_weight
                    component_values += above_repl * normalized_weight * scaling_factor
        
        # Apply position-specific component weight
        component_values *= self.position_weights[position][component]
        
        # Apply additional goalie scaling to bring their WAR in line with skaters
        if category == 'goalie' and component == 'defensive':
            # Reduce goalie impact by scaling their defensive contribution
            component_values *= 0.4  # Additional scaling to reduce goalie dominance
            
        # Store in dataframe, but only for the relevant position
        self.df.loc[mask, f"{component}_war"] = component_values[mask]
    
    def _get_metric_scaling(self, metric: str, position: str) -> float:
        """
        Get scaling factor for a metric to make different metrics comparable.
        
        These values represent approximately how much difference in this metric
        contributes to winning, normalized across metrics.
        """
        # These scaling factors are approximations and would need to be tuned
        # based on empirical analysis of how each metric correlates with winning
        scaling_map = {
            # Offensive metrics
            'points_per_60': 1.0,         # Already scaled per 60 minutes
            'skgoals': 1.5,               # Goals are high value
            'skassists': 1.0,             # Assists are valuable
            'skshots': 0.2,               # Individual shots have lower value
            'skshotattempts': 0.15,       # Shot attempts have lower value
            'shot_generation_rate': 2.0,  # Rate stats are more normalized
            'shot_efficiency': 3.0,       # Efficiency is very valuable
            
            # Defensive metrics
            'skbs': 0.3,                  # Individual blocks have moderate value
            'sktakeaways': 0.4,           # Takeaways are valuable
            'skhits': 0.2,                # Hits have lower direct value
            'skinterceptions': 0.3,       # Interceptions have moderate value
            'skplusmin': 0.5,             # Plus/minus already normalized
            'defensive_actions_per_minute': 2.0,  # Rate stats are more normalized
            
            # Goalie metrics
            'save_percentage': 10.0,      # Save percentage is critical for goalies
            'glsavepct': 8.0,             # In-game save percentage
            'glgaa_normalized': 6.0,      # Normalized GAA
            'goals_saved': 0.5,           # Individual saves
            'glbrksaves': 1.0,            # Breakaway saves are high value
            'gldsaves': 0.8,              # Desperation saves are valuable
            
            # Teamplay metrics
            'passing_percentage': 5.0,    # Percentage metrics need higher scaling
            'skpasspct': 5.0,             # In-game pass percentage
            'skpasses': 0.1,              # Individual passes have lower value
            'puck_management_rating': 1.0, # Already scaled 0-10
            'skpenaltiesdrawn': 0.5,      # Penalties drawn have moderate value
            'penalty_differential': 0.5,  # Penalty differential is valuable
            
            # Default if not specified
            'default': 1.0
        }
        
        # Return the scaling factor, defaulting to 1.0 if not specified
        return scaling_map.get(metric, scaling_map['default'])
    
    def calculate_total_war(self) -> None:
        """Calculate total WAR by combining components and applying context adjustments."""
        # Base WAR is sum of components - using .loc to avoid fragmentation warnings
        self.df.loc[:, 'raw_war'] = self.df['offensive_war'] + self.df['defensive_war'] + self.df['teamplay_war']
        
        # Apply contextual adjustments
        
        # 1. Home/away adjustment (home advantage)
        home_advantage = 0.05  # 5% boost for road performance
        self.df.loc[:, 'context_adjustment'] = 0.0
        self.df.loc[self.df['home_away'] == 'away', 'context_adjustment'] = home_advantage * self.df.loc[self.df['home_away'] == 'away', 'raw_war']
        
        # 2. Game result context
        # Players on winning teams already benefit from better stats
        # but we can add a small clutch performance bonus
        win_adjustment = 0.03  # 3% boost for winning performances
        self.df.loc[self.df['game_result'] == 'win', 'context_adjustment'] += win_adjustment * self.df.loc[self.df['game_result'] == 'win', 'raw_war']
        
        # 3. Apply game_impact_score as a quality factor
        # This prevents low-impact but efficient performances from getting too much value
        # and rewards truly dominant games
        self.df.loc[:, 'impact_factor'] = (self.df['game_impact_score'] / 5.0)  # Scale around 1.0
        self.df.loc[:, 'impact_factor'] = self.df['impact_factor'].clip(0.5, 1.5)  # Limit range
        
        # Apply all adjustments to get final per-game WAR
        self.df.loc[:, 'adjusted_war'] = (self.df['raw_war'] + self.df['context_adjustment']) * self.df['impact_factor']
        
        # Apply final position-based scaling and convert to actual win value
        
        # Skaters
        skater_mask = self.df['position_category'] == 'skater'
        self.df.loc[skater_mask, 'war_value'] = self.df.loc[skater_mask, 'adjusted_war'] / self.win_conversion['skater']
        
        # Goalies - use much higher divisor to bring them in line with skaters
        goalie_mask = self.df['position_category'] == 'goalie'
        self.df.loc[goalie_mask, 'war_value'] = self.df.loc[goalie_mask, 'adjusted_war'] / self.win_conversion['goalie']
        
        print("Total WAR calculated with contextual adjustments.")
    
    def aggregate_player_war(self) -> pd.DataFrame:
        """Aggregate WAR values across all games to get season WAR per player."""
        # Group by player and aggregate
        player_war = self.df.groupby(['player_id', 'player_name', 'detailed_position']).agg({
            'war_value': 'sum',
            'offensive_war': 'sum',
            'defensive_war': 'sum',
            'teamplay_war': 'sum',
            'match_id': 'count',  # Count games played
            'skgoals': 'sum',     # Add key stats for reference
            'skassists': 'sum',
            'skplusmin': 'sum',
            'game_impact_score': 'mean',
        }).reset_index()
        
        # Rename columns
        player_war = player_war.rename(columns={
            'match_id': 'games_played',
            'game_impact_score': 'avg_game_impact'
        })
        
        # Calculate per-game WAR
        player_war['war_per_game'] = player_war['war_value'] / player_war['games_played']
        
        # Total points
        player_war['points'] = player_war['skgoals'] + player_war['skassists']
        
        # Sort by total WAR
        player_war = player_war.sort_values('war_value', ascending=False)
        
        self.player_war = player_war
        return player_war
    
    def analyze_war_distribution(self) -> Dict[str, pd.DataFrame]:
        """Analyze WAR distribution by position."""
        position_analysis = {}
        
        for position in self.position_groups:
            pos_df = self.player_war[self.player_war['detailed_position'] == position]
            if len(pos_df) > 0:
                position_analysis[position] = {
                    'data': pos_df,
                    'mean_war': pos_df['war_value'].mean(),
                    'median_war': pos_df['war_value'].median(),
                    'top_player': pos_df.iloc[0]['player_name'],
                    'top_war': pos_df.iloc[0]['war_value'],
                }
        
        return position_analysis
            
    def visualize_war(self) -> None:
        """Generate visualizations of WAR distributions and components."""
        if self.player_war is None:
            print("Error: Run aggregate_player_war() first")
            return
            
        # Set up the visualization style
        plt.style.use('seaborn-v0_8-darkgrid')
        
        # 1. WAR distribution by position
        plt.figure(figsize=(14, 8))
        
        sns.boxplot(x='detailed_position', y='war_value', data=self.player_war)
        plt.title('WAR Distribution by Position', fontsize=16)
        plt.xlabel('Position', fontsize=14)
        plt.ylabel('Wins Above Replacement', fontsize=14)
        plt.axhline(y=0, color='red', linestyle='--', alpha=0.7)
        plt.tight_layout()
        plt.savefig('war_by_position.png')
        
        # 2. Top players by WAR
        top_n = min(20, len(self.player_war))
        top_players = self.player_war.head(top_n).copy()  # Create a copy to avoid warnings
        
        plt.figure(figsize=(14, 10))
        
        # Create stacked bar chart of WAR components
        ax = plt.subplot(111)
        
        # Scale components to match total WAR
        for idx, row in top_players.iterrows():
            component_sum = row['offensive_war'] + row['defensive_war'] + row['teamplay_war']
            if component_sum > 0:  # Avoid division by zero
                scale_factor = row['war_value'] / component_sum
                top_players.loc[idx, 'offensive_scaled'] = row['offensive_war'] * scale_factor
                top_players.loc[idx, 'defensive_scaled'] = row['defensive_war'] * scale_factor
                top_players.loc[idx, 'teamplay_scaled'] = row['teamplay_war'] * scale_factor
            else:
                top_players.loc[idx, 'offensive_scaled'] = 0
                top_players.loc[idx, 'defensive_scaled'] = 0
                top_players.loc[idx, 'teamplay_scaled'] = 0
        
        # Create labels with position
        labels = [f"{row['player_name']} ({row['detailed_position'][0:2]})" 
                 for _, row in top_players.iterrows()]
        
        # Plot stacked bars
        ax.barh(labels, top_players['offensive_scaled'], color='#1f77b4', alpha=0.8, label='Offensive')
        ax.barh(labels, top_players['defensive_scaled'], left=top_players['offensive_scaled'], 
                color='#ff7f0e', alpha=0.8, label='Defensive')
        ax.barh(labels, top_players['teamplay_scaled'], 
                left=top_players['offensive_scaled'] + top_players['defensive_scaled'],
                color='#2ca02c', alpha=0.8, label='Teamplay')
        
        plt.title('Top Players by WAR', fontsize=16)
        plt.xlabel('Wins Above Replacement', fontsize=14)
        plt.legend(loc='lower right')
        plt.axvline(x=0, color='red', linestyle='--', alpha=0.7)
        plt.grid(True, axis='x')
        plt.tight_layout()
        plt.savefig('top_players_war.png')
        
        # 3. WAR vs Traditional Metrics
        plt.figure(figsize=(14, 8))
        
        # Separate by position for clearer visualization
        colors = {'center': 'blue', 'leftWing': 'green', 'rightWing': 'orange', 
                 'leftDefense': 'red', 'rightDefense': 'purple', 'goalie': 'black'}
        
        for position in self.position_groups:
            pos_data = self.player_war[self.player_war['detailed_position'] == position]
            if len(pos_data) > 0:
                if position != 'goalie':
                    plt.scatter(pos_data['points'], pos_data['war_value'], 
                               alpha=0.7, label=position, color=colors[position])
                else:
                    # For goalies, use save percentage instead of points
                    plt.scatter(pos_data['avg_game_impact'], pos_data['war_value'], 
                               alpha=0.7, label=position, color=colors[position])
        
        plt.title('WAR vs Traditional Metrics', fontsize=16)
        plt.xlabel('Points (Skaters) / Game Impact (Goalies)', fontsize=14)
        plt.ylabel('Wins Above Replacement', fontsize=14)
        plt.axhline(y=0, color='red', linestyle='--', alpha=0.7)
        plt.grid(True)
        plt.legend()
        plt.tight_layout()
        plt.savefig('war_vs_traditional.png')
        
        print("Visualizations created and saved.")
    
    def run_full_war_calculation(self) -> pd.DataFrame:
        """Run the complete WAR calculation pipeline."""
        print("Starting WAR calculation pipeline...")
        
        self.preprocess_data()
        self.establish_replacement_level()
        self.calculate_war_components()
        self.calculate_total_war()
        
        player_war = self.aggregate_player_war()
        
        position_analysis = self.analyze_war_distribution()
        
        # Print summary of results
        print("\nWAR Calculation Complete!")
        print(f"Total players analyzed: {len(player_war)}")
        
        print("\nPosition Analysis:")
        for position, analysis in position_analysis.items():
            print(f"\n{position}:")
            print(f"  Players: {len(analysis['data'])}")
            print(f"  Mean WAR: {analysis['mean_war']:.3f}")
            print(f"  Median WAR: {analysis['median_war']:.3f}")
            print(f"  Top player: {analysis['top_player']} ({analysis['top_war']:.3f} WAR)")
        
        self.visualize_war()
        self.generate_player_reports()
        
        # Save results to CSV
        player_war.to_csv('player_war_results.csv', index=False)
        print("\nResults saved to player_war_results.csv")
        
        return player_war
    
    def generate_player_reports(self) -> None:
        """Generate individual reports for top players."""
        if self.player_war is None:
            print("Error: Run aggregate_player_war() first")
            return
            
        # Create directory for player reports
        import os
        os.makedirs('player_reports', exist_ok=True)
        
        # Process top players (or all players above a threshold)
        players_to_analyze = self.player_war[self.player_war['war_value'] > 0].head(30)
        
        print(f"Generating individual reports for {len(players_to_analyze)} players...")
        
        for _, player in players_to_analyze.iterrows():
            self._create_player_report(player)
        
        print("Individual player reports complete.")
        
    def _create_player_report(self, player_row):
        """Create detailed report for a single player."""
        player_id = player_row['player_id']
        player_name = player_row['player_name']
        position = player_row['detailed_position']
        
        # Get player game data
        player_games = self.df[self.df['player_id'] == player_id].copy()
        
        # Set up multipage figure
        fig = plt.figure(figsize=(15, 12))
        fig.suptitle(f"Player Report: {player_name} ({position})", fontsize=18)
        
        # 1. Game-by-game WAR components
        ax1 = plt.subplot(2, 2, 1)
        self._plot_war_by_game(ax1, player_games)
        
        # 2. Opponents analysis
        ax2 = plt.subplot(2, 2, 2)
        self._plot_opponent_analysis(ax2, player_games)
        
        # 3. WAR component breakdown
        ax3 = plt.subplot(2, 2, 3)
        self._plot_war_components(ax3, player_row)
        
        # 4. Teammate synergy
        ax4 = plt.subplot(2, 2, 4)
        self._plot_teammate_analysis(ax4, player_id, player_games)
        
        # Save figure
        plt.tight_layout(rect=[0, 0, 1, 0.95])  # Adjust for title
        plt.savefig(f"player_reports/{player_name.replace(' ', '_')}_report.png")
        plt.close()
        
    def _plot_war_by_game(self, ax, player_games):
        """Plot WAR components for each game."""
        # Sort by date/game number
        player_games = player_games.sort_values('match_id')
        
        # Extract components
        games = range(1, len(player_games) + 1)
        
        # Plot stacked bars for components
        ax.bar(games, player_games['offensive_war'], label='Offensive', color='#1f77b4')
        ax.bar(games, player_games['defensive_war'], bottom=player_games['offensive_war'], 
            label='Defensive', color='#ff7f0e')
        ax.bar(games, player_games['teamplay_war'], 
            bottom=player_games['offensive_war'] + player_games['defensive_war'],
            label='Teamplay', color='#2ca02c')
            
        # Add total WAR line
        ax.plot(games, player_games['war_value'], 'k--', label='Total WAR')
        
        ax.set_title('WAR Components by Game')
        ax.set_xlabel('Game Number')
        ax.set_ylabel('WAR Value')
        ax.legend()
        ax.grid(True, alpha=0.3)
        ax.axhline(y=0, color='red', linestyle='--', alpha=0.3)
    
    def _plot_opponent_analysis(self, ax, player_games):
        """Plot player performance against different opponents."""
        # Check if opponent data is available
        if 'opponent_team' not in player_games.columns:
            ax.text(0.5, 0.5, "Opponent data not available", 
                    ha='center', va='center', fontsize=12)
            ax.set_title('Performance vs Opponents')
            return
        
        # Group by opponent and calculate average WAR and count games
        opponent_stats = player_games.groupby('opponent_team').agg({
            'war_value': ['mean', 'count'],
            'offensive_war': 'mean',
            'defensive_war': 'mean',
            'teamplay_war': 'mean'
        }).reset_index()
        
        # Flatten multi-level columns
        opponent_stats.columns = ['_'.join(col).strip('_') for col in opponent_stats.columns.values]
        
        # Only include opponents with at least 2 games for reliability
        opponent_stats = opponent_stats[opponent_stats['war_value_count'] >= 2]
        
        if len(opponent_stats) == 0:
            ax.text(0.5, 0.5, "Insufficient opponent data\n(need 2+ games vs same opponent)", 
                    ha='center', va='center', fontsize=12)
            ax.set_title('Performance vs Opponents')
            return
        
        # Sort by average WAR
        opponent_stats = opponent_stats.sort_values('war_value_mean')
        
        # Create stacked bar chart
        y_pos = range(len(opponent_stats))
        
        # Plot stacked components
        ax.barh(y_pos, opponent_stats['offensive_war_mean'], color='#1f77b4', label='Offensive')
        ax.barh(y_pos, opponent_stats['defensive_war_mean'], 
               left=opponent_stats['offensive_war_mean'], color='#ff7f0e', label='Defensive')
        ax.barh(y_pos, opponent_stats['teamplay_war_mean'], 
               left=opponent_stats['offensive_war_mean'] + opponent_stats['defensive_war_mean'],
               color='#2ca02c', label='Teamplay')
        
        # Set y-tick labels to opponent names
        ax.set_yticks(y_pos)
        ax.set_yticklabels([f"{team} ({count})" for team, count in 
                           zip(opponent_stats['opponent_team'], opponent_stats['war_value_count'])])
        
        ax.set_title('Average WAR Against Opponents')
        ax.set_xlabel('WAR Value')
        ax.axvline(x=0, color='red', linestyle='--', alpha=0.3)
        ax.legend(loc='lower right')
        ax.grid(True, axis='x', alpha=0.3)
    
    def _plot_war_components(self, ax, player_row):
        """Create a pie chart showing WAR component breakdown for the player."""
        # Get components
        offensive = player_row['offensive_war']
        defensive = player_row['defensive_war']
        teamplay = player_row['teamplay_war']
        
        # Handle negative values for pie chart (can't show negative in pie)
        components = []
        labels = []
        colors = []
        
        if offensive > 0:
            components.append(offensive)
            labels.append(f'Offensive ({offensive:.2f})')
            colors.append('#1f77b4')
            
        if defensive > 0:
            components.append(defensive)
            labels.append(f'Defensive ({defensive:.2f})')
            colors.append('#ff7f0e')
            
        if teamplay > 0:
            components.append(teamplay)
            labels.append(f'Teamplay ({teamplay:.2f})')
            colors.append('#2ca02c')
        
        # Create pie chart if we have positive components
        if sum(components) > 0:
            ax.pie(components, labels=labels, colors=colors, autopct='%1.1f%%', 
                  startangle=90, shadow=True)
            ax.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
        else:
            ax.text(0.5, 0.5, "No positive WAR components", 
                    ha='center', va='center', fontsize=12)
        
        position = player_row['detailed_position']
        ax.set_title(f'WAR Component Breakdown - Total: {player_row["war_value"]:.2f}')
        
        # Add position weights as a text note
        if position in self.position_weights:
            weights = self.position_weights[position]
            weight_text = f"Position Weights: Off={weights['offensive']:.2f}, Def={weights['defensive']:.2f}, Team={weights['teamplay']:.2f}"
            ax.text(0.5, -0.1, weight_text, transform=ax.transAxes, ha='center', fontsize=9)
    
    def _plot_teammate_analysis(self, ax, player_id, player_games):
        """Analyze how player performs with different teammates."""
        # Get match IDs where this player played
        player_match_ids = set(player_games['match_id'].unique())
        
        # Find teammates from those matches
        teammate_data = self.df[self.df['match_id'].isin(player_match_ids)].copy()
        
        # Exclude the player themselves
        teammate_data = teammate_data[teammate_data['player_id'] != player_id]
        
        # Group by teammate and count matches together
        teammates = teammate_data.groupby(['player_id', 'player_name']).agg({
            'match_id': 'nunique',  # Count unique matches together
            'war_value': 'mean',    # Average WAR of teammate
        }).reset_index()
        
        # Rename columns
        teammates.columns = ['teammate_id', 'teammate_name', 'games_together', 'teammate_avg_war']
        
        # Only include teammates with 3+ games together
        teammates = teammates[teammates['games_together'] >= 3]
        
        if len(teammates) == 0:
            ax.text(0.5, 0.5, "Insufficient teammate data\n(need 3+ games with teammates)", 
                    ha='center', va='center', fontsize=12)
            ax.set_title('Teammate Analysis')
            return
        
        # Sort by teammate WAR
        teammates = teammates.sort_values('teammate_avg_war', ascending=False)
        
        # Take top and bottom teammates for clarity
        top_n = min(5, len(teammates))
        if len(teammates) > 10:
            teammates = pd.concat([teammates.head(top_n), teammates.tail(top_n)])
        
        # Create bar chart
        y_pos = range(len(teammates))
        bars = ax.barh(y_pos, teammates['teammate_avg_war'], color='#1f77b4')
        
        # Color bars based on positive/negative
        for i, bar in enumerate(bars):
            if teammates.iloc[i]['teammate_avg_war'] < 0:
                bar.set_color('#d62728')  # Red for negative
        
        # Add game count annotations
        for i, bar in enumerate(bars):
            ax.text(
                0.5 if bar.get_width() < 0 else bar.get_width() + 0.2,
                bar.get_y() + bar.get_height()/2,
                f"({teammates.iloc[i]['games_together']} games)",
                va='center', fontsize=8
            )
        
        # Set y-tick labels to teammate names
        ax.set_yticks(y_pos)
        ax.set_yticklabels(teammates['teammate_name'])
        
        ax.set_title('Teammate Performance')
        ax.set_xlabel('Average WAR Value')
        ax.axvline(x=0, color='red', linestyle='--', alpha=0.3)
        ax.grid(True, axis='x', alpha=0.3)

# Main execution
if __name__ == "__main__":
    # Initialize the WAR calculator
    hockey_war = HockeyWAR("outputs/player_stats.csv")
    
    # Run the full calculation
    results = hockey_war.run_full_war_calculation()
    
    # Display top 10 players by WAR
    print("\nTop 10 Players by WAR:")
    print(results[['player_name', 'detailed_position', 'games_played', 'war_value', 'war_per_game', 'points', 'skplusmin']].head(10))
    
    # Display bottom 10 players by WAR
    print("\nBottom 10 Players by WAR:")
    print(results[['player_name', 'detailed_position', 'games_played', 'war_value', 'war_per_game', 'points', 'skplusmin']].tail(10))