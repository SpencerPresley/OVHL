"""
Hockey WAR Machine Learning Analysis

This module provides various machine learning tools for analyzing player WAR data,
including clustering, prediction, position-specific analysis, and player similarity.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
import os


class WARAnalytics:
    """Machine learning analytics for hockey WAR data."""
    
    def __init__(self, data_path='player_war_results.csv'):
        """Initialize with path to the player WAR data CSV."""
        self.data_path = data_path
        self.player_data = None
        self.scaled_data = None
        self.cluster_model = None
        self.prediction_model = None
        self.position_models = {}
        self.similarity_matrix = None
        
        # Create output directory
        os.makedirs('ml_outputs', exist_ok=True)
        
    def load_data(self):
        """Load and preprocess player data."""
        self.player_data = pd.read_csv(self.data_path)
        print(f"Loaded data for {len(self.player_data)} players")
        
        # Add derived metrics if needed
        if 'war_per_game' not in self.player_data.columns:
            self.player_data['war_per_game'] = self.player_data['war_value'] / self.player_data['games_played']
        
        # Filter to players with minimum games
        min_games = 3
        self.player_data = self.player_data[self.player_data['games_played'] >= min_games]
        print(f"Filtered to {len(self.player_data)} players with {min_games}+ games")
        
        return self.player_data
    
    def run_clustering_analysis(self, n_clusters=None, cluster_features=None):
        """
        Perform player clustering to identify archetypes.
        
        Parameters:
        -----------
        n_clusters : int, optional
            Number of clusters to use. If None, determine automatically.
        cluster_features : list, optional
            Features to use for clustering. If None, use default set.
        """
        if self.player_data is None:
            self.load_data()
            
        # Set default features if not specified
        if cluster_features is None:
            cluster_features = [
                'offensive_war', 'defensive_war', 'teamplay_war', 
                'war_per_game', 'points', 'skplusmin'
            ]
            
        # Ensure all features exist in the dataset
        valid_features = [f for f in cluster_features if f in self.player_data.columns]
        if len(valid_features) < 2:
            raise ValueError("Not enough valid features for clustering")
            
        print(f"Running clustering with features: {valid_features}")
        
        # Scale the data
        scaler = StandardScaler()
        self.scaled_data = scaler.fit_transform(self.player_data[valid_features])
        
        # Determine optimal number of clusters if not specified
        if n_clusters is None:
            wcss = []
            max_clusters = min(10, len(self.player_data) // 5)  # Reasonable max
            for i in range(1, max_clusters + 1):
                kmeans = KMeans(n_clusters=i, random_state=42, n_init=10)
                kmeans.fit(self.scaled_data)
                wcss.append(kmeans.inertia_)
                
            # Plot the elbow curve
            plt.figure(figsize=(10, 6))
            plt.plot(range(1, max_clusters + 1), wcss, marker='o')
            plt.title('Elbow Method for Optimal Clusters')
            plt.xlabel('Number of Clusters')
            plt.ylabel('WCSS (Within-Cluster Sum of Squares)')
            plt.tight_layout()
            plt.savefig('ml_outputs/elbow_curve.png')
            
            # Simple elbow detection
            diffs = np.diff(wcss)
            elbow_idx = np.argmax(np.diff(diffs)) + 1
            n_clusters = elbow_idx + 1
            print(f"Automatic elbow detection suggests {n_clusters} clusters")
        
        # Fit the KMeans model
        self.cluster_model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        self.player_data['cluster'] = self.cluster_model.fit_predict(self.scaled_data)
        
        # Analyze cluster characteristics
        self._analyze_clusters(valid_features)
        
        return self.player_data['cluster']
    
    def _analyze_clusters(self, features):
        """Analyze and visualize cluster characteristics."""
        # Cluster statistics
        cluster_stats = self.player_data.groupby('cluster').agg({
            'player_name': 'count',
            'war_value': 'mean',
            'offensive_war': 'mean',
            'defensive_war': 'mean',
            'teamplay_war': 'mean',
            'points': 'mean',
            'games_played': 'mean'
        }).rename(columns={'player_name': 'count'})
        
        print("\nCluster Statistics:")
        print(cluster_stats)
        
        # Position distribution in clusters
        pos_distribution = pd.crosstab(
            self.player_data['cluster'], 
            self.player_data['detailed_position'],
            normalize='index'
        ) * 100
        
        print("\nPosition Distribution by Cluster (%):")
        print(pos_distribution.round(1))
        
        # Visualize clusters (PCA to 2D for visualization)
        pca = PCA(n_components=2)
        pca_result = pca.fit_transform(self.scaled_data)
        
        plt.figure(figsize=(12, 8))
        
        # Plot each cluster
        for cluster in sorted(self.player_data['cluster'].unique()):
            cluster_points = pca_result[self.player_data['cluster'] == cluster]
            plt.scatter(
                cluster_points[:, 0], 
                cluster_points[:, 1],
                label=f'Cluster {cluster} (n={len(cluster_points)})'
            )
            
        # Annotate some top players
        top_players = self.player_data.nlargest(10, 'war_value')
        for _, player in top_players.iterrows():
            idx = self.player_data.index.get_loc(player.name)
            plt.annotate(
                player['player_name'],
                (pca_result[idx, 0], pca_result[idx, 1]),
                fontsize=8
            )
            
        plt.title('Player Clusters (PCA Visualization)')
        plt.xlabel(f'Principal Component 1 ({pca.explained_variance_ratio_[0]:.2%} variance)')
        plt.ylabel(f'Principal Component 2 ({pca.explained_variance_ratio_[1]:.2%} variance)')
        plt.legend()
        plt.tight_layout()
        plt.savefig('ml_outputs/player_clusters.png')
        
        # Radar chart for cluster profiles
        self._plot_cluster_radar(features)
        
        # Save top examples from each cluster
        with open('ml_outputs/cluster_examples.txt', 'w') as f:
            for cluster in sorted(self.player_data['cluster'].unique()):
                cluster_df = self.player_data[self.player_data['cluster'] == cluster]
                top_examples = cluster_df.nlargest(5, 'war_value')
                
                f.write(f"\nCluster {cluster} Examples:\n")
                f.write(f"  Avg WAR: {cluster_df['war_value'].mean():.2f}\n")
                f.write(f"  Player count: {len(cluster_df)}\n")
                f.write("  Top representatives:\n")
                
                for _, player in top_examples.iterrows():
                    f.write(f"    {player['player_name']} ({player['detailed_position']}) - "
                            f"WAR: {player['war_value']:.2f}, Points: {player['points']}\n")
    
    def _plot_cluster_radar(self, features):
        """Create radar chart profiles for each cluster."""
        # Get cluster means
        cluster_profiles = self.player_data.groupby('cluster')[features].mean()
        
        # Normalize the data for radar chart
        scaler = StandardScaler()
        cluster_profiles_scaled = pd.DataFrame(
            scaler.fit_transform(cluster_profiles),
            index=cluster_profiles.index,
            columns=cluster_profiles.columns
        )
        
        # Set up the radar chart
        n_clusters = len(cluster_profiles)
        n_features = len(features)
        angles = np.linspace(0, 2*np.pi, n_features, endpoint=False).tolist()
        angles += angles[:1]  # Close the circle
        
        fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))
        
        # Add feature labels
        plt.xticks(angles[:-1], features, size=12)
        
        # Plot each cluster
        for cluster in sorted(cluster_profiles_scaled.index):
            values = cluster_profiles_scaled.loc[cluster].values.tolist()
            values += values[:1]  # Close the circle
            
            ax.plot(angles, values, linewidth=2, label=f'Cluster {cluster}')
            ax.fill(angles, values, alpha=0.1)
            
        plt.title('Cluster Profiles', size=15)
        plt.legend(loc='upper right')
        plt.tight_layout()
        plt.savefig('ml_outputs/cluster_radar.png')
    
    def build_war_prediction_model(self, features=None, test_size=0.25):
        """
        Build a model to predict WAR from traditional stats.
        
        Parameters:
        -----------
        features : list, optional
            Features to use for prediction. If None, use default set.
        test_size : float, optional
            Proportion of data to use for testing.
            
        Returns:
        --------
        dict : Dictionary with model performance metrics
        """
        if self.player_data is None:
            self.load_data()
            
        # Set default features if not specified
        if features is None:
            features = [
                'skgoals', 'skassists', 'skplusmin', 'points', 
                'games_played', 'skshots', 'skhits'
            ]
            
        # Ensure all features exist
        valid_features = [f for f in features if f in self.player_data.columns]
        if len(valid_features) < 2:
            raise ValueError("Not enough valid features for prediction")
            
        print(f"Building prediction model with features: {valid_features}")
        
        # Prepare data
        X = self.player_data[valid_features]
        y = self.player_data['war_value']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Train multiple models and select best
        models = {
            'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingRegressor(random_state=42)
        }
        
        best_model = None
        best_score = -np.inf
        cv_results = {}
        
        for name, model in models.items():
            # Cross-validation
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
            cv_results[name] = {
                'mean_cv_score': cv_scores.mean(),
                'std_cv_score': cv_scores.std()
            }
            
            print(f"{name} CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
            
            # Track best model
            if cv_scores.mean() > best_score:
                best_score = cv_scores.mean()
                best_model = model
                
        # Train best model on full training set
        best_model.fit(X_train, y_train)
        self.prediction_model = best_model
        
        # Evaluate on test set
        y_pred = best_model.predict(X_test)
        metrics = {
            'r2': r2_score(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred)
        }
        
        print(f"\nTest set performance:")
        print(f"R²: {metrics['r2']:.4f}")
        print(f"RMSE: {metrics['rmse']:.4f}")
        print(f"MAE: {metrics['mae']:.4f}")
        
        # Feature importance
        if hasattr(best_model, 'feature_importances_'):
            importance = pd.DataFrame({
                'feature': valid_features,
                'importance': best_model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            print("\nFeature importance:")
            print(importance)
            
            # Visualize feature importance
            plt.figure(figsize=(10, 6))
            sns.barplot(x='importance', y='feature', data=importance)
            plt.title('Feature Importance for WAR Prediction')
            plt.tight_layout()
            plt.savefig('ml_outputs/feature_importance.png')
            
            # Save feature importance to file
            importance.to_csv('ml_outputs/feature_importance.csv', index=False)
        
        # Plot actual vs predicted
        plt.figure(figsize=(10, 8))
        plt.scatter(y_test, y_pred, alpha=0.5)
        plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--')
        plt.xlabel('Actual WAR')
        plt.ylabel('Predicted WAR')
        plt.title('Actual vs Predicted WAR')
        plt.tight_layout()
        plt.savefig('ml_outputs/actual_vs_predicted.png')
        
        # Identify players where model struggles
        test_results = pd.DataFrame({
            'player_name': self.player_data.loc[X_test.index, 'player_name'],
            'position': self.player_data.loc[X_test.index, 'detailed_position'],
            'actual_war': y_test,
            'predicted_war': y_pred,
            'error': y_test - y_pred
        })
        
        # Largest overestimates and underestimates
        print("\nLargest prediction errors:")
        print(test_results.nlargest(5, 'error')[['player_name', 'position', 'actual_war', 'predicted_war', 'error']])
        print(test_results.nsmallest(5, 'error')[['player_name', 'position', 'actual_war', 'predicted_war', 'error']])
        
        return metrics
    
    def build_position_models(self, features=None, min_players=15):
        """
        Build position-specific WAR prediction models.
        
        Parameters:
        -----------
        features : list, optional
            Features to use for prediction. If None, use default set.
        min_players : int, optional
            Minimum number of players needed to build a position model.
            
        Returns:
        --------
        dict : Position-specific models and their performance
        """
        if self.player_data is None:
            self.load_data()
            
        # Set default features if not specified
        if features is None:
            features = [
                'skgoals', 'skassists', 'skplusmin', 'points', 
                'games_played', 'skshots', 'skhits'
            ]
        
        # Get valid features
        valid_features = [f for f in features if f in self.player_data.columns]
        if len(valid_features) < 2:
            raise ValueError("Not enough valid features for prediction")
            
        # Store importance by position
        position_importance = {}
        
        # Build model for each position
        for position in self.player_data['detailed_position'].unique():
            # Filter to this position
            position_df = self.player_data[self.player_data['detailed_position'] == position]
            
            # Skip if not enough players
            if len(position_df) < min_players:
                print(f"Skipping {position} (only {len(position_df)} players, need {min_players})")
                continue
                
            print(f"\nBuilding model for {position} ({len(position_df)} players)")
            
            # Prepare data
            X = position_df[valid_features]
            y = position_df['war_value']
            
            # Train model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X, y, cv=5, scoring='r2')
            print(f"CV R² for {position}: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
            
            # Train on full position dataset
            model.fit(X, y)
            
            # Store model
            self.position_models[position] = {
                'model': model,
                'cv_r2_mean': cv_scores.mean(),
                'cv_r2_std': cv_scores.std()
            }
            
            # Feature importance
            if hasattr(model, 'feature_importances_'):
                importance = dict(zip(valid_features, model.feature_importances_))
                position_importance[position] = importance
                
                # Sort and display
                sorted_imp = sorted(importance.items(), key=lambda x: x[1], reverse=True)
                print(f"Top features for {position}:")
                for feat, imp in sorted_imp[:3]:
                    print(f"  {feat}: {imp:.4f}")
        
        # Compare feature importance across positions
        if position_importance:
            imp_df = pd.DataFrame(position_importance)
            
            # Visualize as heatmap
            plt.figure(figsize=(12, 8))
            sns.heatmap(imp_df, cmap='viridis', annot=True, fmt='.2f')
            plt.title('Feature Importance by Position')
            plt.tight_layout()
            plt.savefig('ml_outputs/position_importance.png')
            
            # Save to file
            imp_df.to_csv('ml_outputs/position_importance.csv')
            
        return self.position_models
    
    def build_player_similarity_engine(self, features=None):
        """
        Build a player similarity engine using cosine similarity.
        
        Parameters:
        -----------
        features : list, optional
            Features to use for similarity. If None, use default set.
            
        Returns:
        --------
        similarity_matrix : np.ndarray
            Matrix of player similarities
        """
        if self.player_data is None:
            self.load_data()
            
        # Set default features if not specified
        if features is None:
            features = [
                'offensive_war', 'defensive_war', 'teamplay_war', 
                'war_per_game', 'points', 'skgoals', 'skassists'
            ]
            
        # Ensure all features exist
        valid_features = [f for f in features if f in self.player_data.columns]
        if len(valid_features) < 2:
            raise ValueError("Not enough valid features for similarity calculation")
            
        print(f"Building similarity engine with features: {valid_features}")
        
        # Scale the data
        scaler = StandardScaler()
        similarity_data = scaler.fit_transform(self.player_data[valid_features])
        
        # Calculate similarity matrix
        self.similarity_matrix = cosine_similarity(similarity_data)
        
        # Create a function to find similar players
        with open('ml_outputs/player_similarity_examples.txt', 'w') as f:
            # Get examples for top players
            top_players = self.player_data.nlargest(10, 'war_value')
            
            for _, player in top_players.iterrows():
                similar_players = self.find_similar_players(player['player_name'], n=5)
                
                f.write(f"\nPlayers similar to {player['player_name']} ({player['detailed_position']}):\n")
                f.write(f"  WAR: {player['war_value']:.2f}, Games: {player['games_played']}\n")
                f.write("  Similar players:\n")
                
                for _, similar in similar_players.iterrows():
                    f.write(f"    {similar['player_name']} ({similar['detailed_position']}) - "
                            f"WAR: {similar['war_value']:.2f}, Similarity: {similar['similarity']:.2%}\n")
        
        return self.similarity_matrix
    
    def find_similar_players(self, player_name, n=5, include_position=False):
        """
        Find players similar to the specified player.
        
        Parameters:
        -----------
        player_name : str
            Name of the player to find similar players for
        n : int, optional
            Number of similar players to return
        include_position : bool, optional
            Whether to restrict to players of the same position
            
        Returns:
        --------
        DataFrame : Similar players with similarity scores
        """
        if self.similarity_matrix is None:
            self.build_player_similarity_engine()
            
        # Find player index
        if player_name not in self.player_data['player_name'].values:
            raise ValueError(f"Player {player_name} not found in data")
            
        player_idx = self.player_data[self.player_data['player_name'] == player_name].index[0]
        player_position = self.player_data.loc[player_idx, 'detailed_position']
        
        # Get similarities to this player
        similarities = self.similarity_matrix[player_idx]
        
        # Create DataFrame with players and similarities
        similar_df = pd.DataFrame({
            'index': self.player_data.index,
            'player_name': self.player_data['player_name'],
            'detailed_position': self.player_data['detailed_position'],
            'war_value': self.player_data['war_value'],
            'similarity': similarities
        })
        
        # Filter out the player themselves
        similar_df = similar_df[similar_df['index'] != player_idx]
        
        # Optionally filter to same position
        if include_position:
            similar_df = similar_df[similar_df['detailed_position'] == player_position]
            
        # Get top n similar players
        return similar_df.nlargest(n, 'similarity')
    
    def run_full_analysis(self):
        """Run all analysis methods and generate reports."""
        print("Starting WAR ML Analysis Pipeline...")
        
        # Load data
        self.load_data()
        
        # Run clustering
        print("\n--- Player Clustering Analysis ---")
        self.run_clustering_analysis()
        
        # Build WAR prediction model
        print("\n--- WAR Prediction Model ---")
        self.build_war_prediction_model()
        
        # Build position-specific models
        print("\n--- Position-Specific Models ---")
        self.build_position_models()
        
        # Build player similarity engine
        print("\n--- Player Similarity Engine ---")
        self.build_player_similarity_engine()
        
        print("\nAnalysis complete! Results saved to ml_outputs/ directory")
        
        # Generate summary report
        self._generate_summary_report()
        
        return {
            'player_data': self.player_data,
            'cluster_model': self.cluster_model,
            'prediction_model': self.prediction_model,
            'position_models': self.position_models,
            'similarity_matrix': self.similarity_matrix
        }
    
    def _generate_summary_report(self):
        """Generate a summary report of all analyses."""
        with open('ml_outputs/summary_report.txt', 'w') as f:
            f.write("WAR ML Analysis Summary Report\n")
            f.write("==============================\n\n")
            
            # Dataset summary
            f.write(f"Dataset: {self.data_path}\n")
            f.write(f"Players analyzed: {len(self.player_data)}\n")
            f.write(f"Positions: {', '.join(self.player_data['detailed_position'].unique())}\n\n")
            
            # Clustering summary
            if self.cluster_model is not None:
                f.write("Player Clustering\n")
                f.write("----------------\n")
                f.write(f"Number of clusters: {self.cluster_model.n_clusters}\n")
                
                cluster_counts = self.player_data['cluster'].value_counts().sort_index()
                for cluster, count in cluster_counts.items():
                    avg_war = self.player_data[self.player_data['cluster'] == cluster]['war_value'].mean()
                    f.write(f"Cluster {cluster}: {count} players, avg WAR: {avg_war:.2f}\n")
                f.write("\n")
            
            # WAR prediction summary
            if self.prediction_model is not None:
                f.write("WAR Prediction Model\n")
                f.write("-------------------\n")
                f.write(f"Model type: {type(self.prediction_model).__name__}\n")
                
                if hasattr(self.prediction_model, 'feature_importances_'):
                    top_features = sorted(
                        zip(self.prediction_model.feature_names_in_, self.prediction_model.feature_importances_),
                        key=lambda x: x[1],
                        reverse=True
                    )[:5]
                    
                    f.write("Top features:\n")
                    for feature, importance in top_features:
                        f.write(f"  {feature}: {importance:.4f}\n")
                f.write("\n")
            
            # Position models summary
            if self.position_models:
                f.write("Position-Specific Models\n")
                f.write("----------------------\n")
                
                for position, model_info in self.position_models.items():
                    f.write(f"{position}: R² = {model_info['cv_r2_mean']:.4f}\n")
                f.write("\n")
            
            # Wrap up
            f.write("Analysis artifacts saved to ml_outputs/ directory\n")


if __name__ == "__main__":
    # Create analytics instance
    analytics = WARAnalytics('player_war_results.csv')
    
    # Run full analysis pipeline
    analytics.run_full_analysis()
    
    # Example: Find similar players to the top player
    player_data = analytics.player_data
    if player_data is not None and len(player_data) > 0:
        top_player = player_data.nlargest(1, 'war_value')['player_name'].iloc[0]
        print(f"\nPlayers similar to {top_player}:")
        similar = analytics.find_similar_players(top_player, n=3)
        print(similar[['player_name', 'detailed_position', 'war_value', 'similarity']]) 