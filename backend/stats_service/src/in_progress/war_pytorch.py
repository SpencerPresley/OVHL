import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import torch.nn.functional as F
from sklearn.metrics import r2_score, mean_squared_error

# Set random seeds for reproducibility
np.random.seed(42)
torch.manual_seed(42)

class PositionAwareMultiTaskWAR(nn.Module):
    """
    Neural network that predicts total WAR and WAR components
    while incorporating player position information.
    """
    def __init__(self, input_dim, num_positions=6):
        super().__init__()
        # Position embedding layer
        self.position_embeddings = nn.Embedding(num_positions, 8)
        
        # Shared layers
        self.shared = nn.Sequential(
            nn.Linear(input_dim + 8, 64),  # +8 for position embedding
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # Task-specific layers
        self.total_war_head = nn.Linear(32, 1)
        self.offensive_head = nn.Linear(32, 1)
        self.defensive_head = nn.Linear(32, 1)
        self.teamplay_head = nn.Linear(32, 1)
        
    def forward(self, features, position_idx):
        # Get position embeddings and concatenate with input features
        position_emb = self.position_embeddings(position_idx)
        combined = torch.cat([features, position_emb], dim=1)
        
        # Pass through shared layers
        shared_features = self.shared(combined)
        
        # Get predictions from each head
        total_war = self.total_war_head(shared_features)
        offensive_war = self.offensive_head(shared_features)
        defensive_war = self.defensive_head(shared_features)
        teamplay_war = self.teamplay_head(shared_features)
        
        return {
            'total_war': total_war,
            'offensive_war': offensive_war,
            'defensive_war': defensive_war,
            'teamplay_war': teamplay_war
        }

class PlayerEmbeddingNet(nn.Module):
    """
    Neural network that creates player embeddings for similarity analysis
    and visualization.
    """
    def __init__(self, input_dim, embedding_dim=8, num_positions=6):
        super().__init__()
        # Position embedding
        self.position_embeddings = nn.Embedding(num_positions, 8)
        
        # Encoder network
        self.encoder = nn.Sequential(
            nn.Linear(input_dim + 8, 32),  # +8 for position embedding
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, embedding_dim)
        )
        
        # Decoder for reconstruction (optional, helps with training)
        self.decoder = nn.Sequential(
            nn.Linear(embedding_dim, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )
        
    def forward(self, features, position_idx):
        # Get position embeddings
        position_emb = self.position_embeddings(position_idx)
        combined = torch.cat([features, position_emb], dim=1)
        
        # Generate embeddings
        embeddings = self.encoder(combined)
        
        # Reconstruct input (for training)
        reconstructed = self.decoder(embeddings)
        
        return embeddings, reconstructed

def load_and_preprocess_data(csv_path):
    """Load and preprocess the WAR data from CSV."""
    df = pd.read_csv(csv_path)
    
    # Filter to players with enough games (e.g., 3+)
    df = df[df['games_played'] >= 3].copy()
    
    # Convert position to numerical index
    positions = ['leftWing', 'center', 'goalie', 'rightWing', 'rightDefense', 'leftDefense']
    position_map = {pos: i for i, pos in enumerate(positions)}
    df['position_idx'] = df['detailed_position'].map(position_map)
    
    # Select features and targets
    features = ['skgoals', 'skassists', 'skplusmin', 'points', 'games_played']
    targets = ['war_value', 'offensive_war', 'defensive_war', 'teamplay_war']
    
    # Handle missing values (replace with 0 for goalies)
    for col in features:
        if col not in ['games_played']:  # Keep games_played as is
            df[col] = df[col].fillna(0)  # Fill NaN with 0 (for goalie skater stats)
    
    # Split data
    X = df[features].values
    y = df[targets].values
    position_idx = df['position_idx'].values
    player_names = df['player_name'].values
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    return X_scaled, y, position_idx, player_names, df, features, targets

def train_multitask_model(X, y, position_idx, batch_size=16, epochs=100, lr=0.001):
    """Train the position-aware multi-task WAR model."""
    # Split data
    X_train, X_test, y_train, y_test, pos_train, pos_test = train_test_split(
        X, y, position_idx, test_size=0.2, random_state=42)
    
    # Convert to PyTorch tensors
    X_train_tensor = torch.FloatTensor(X_train)
    y_train_tensor = torch.FloatTensor(y_train)
    pos_train_tensor = torch.LongTensor(pos_train)
    
    X_test_tensor = torch.FloatTensor(X_test)
    y_test_tensor = torch.FloatTensor(y_test)
    pos_test_tensor = torch.LongTensor(pos_test)
    
    # Create data loaders
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor, pos_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    # Initialize model
    input_dim = X.shape[1]
    model = PositionAwareMultiTaskWAR(input_dim)
    
    # Loss and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    # Training loop
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        
        for batch_X, batch_y, batch_pos in train_loader:
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(batch_X, batch_pos)
            
            # Calculate loss for each task
            total_war_loss = criterion(outputs['total_war'], batch_y[:, 0:1])
            offensive_loss = criterion(outputs['offensive_war'], batch_y[:, 1:2])
            defensive_loss = criterion(outputs['defensive_war'], batch_y[:, 2:3])
            teamplay_loss = criterion(outputs['teamplay_war'], batch_y[:, 3:4])
            
            # Combined loss (can adjust weights if needed)
            loss = total_war_loss + 0.5 * (offensive_loss + defensive_loss + teamplay_loss)
            
            # Backward pass and optimize
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
        
        # Print progress every 10 epochs
        if (epoch + 1) % 10 == 0:
            print(f'Epoch {epoch+1}/{epochs}, Loss: {epoch_loss/len(train_loader):.4f}')
    
    # Evaluate on test set
    model.eval()
    with torch.no_grad():
        outputs = model(X_test_tensor, pos_test_tensor)
        
        # Calculate metrics for total WAR
        y_pred = outputs['total_war'].numpy()
        y_true = y_test[:, 0]
        
        r2 = r2_score(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        
        print(f'Test R²: {r2:.4f}')
        print(f'Test RMSE: {rmse:.4f}')
    
    return model

def train_embedding_model(X, position_idx, player_names, batch_size=16, epochs=50, lr=0.001):
    """Train the player embedding model."""
    # Convert to PyTorch tensors
    X_tensor = torch.FloatTensor(X)
    pos_tensor = torch.LongTensor(position_idx)
    
    # Create data loader
    dataset = TensorDataset(X_tensor, pos_tensor)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    # Initialize model
    input_dim = X.shape[1]
    model = PlayerEmbeddingNet(input_dim, embedding_dim=2)  # 2D for easy visualization
    
    # Loss and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    # Training loop
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        
        for batch_X, batch_pos in loader:
            optimizer.zero_grad()
            
            # Forward pass
            embeddings, reconstructed = model(batch_X, batch_pos)
            
            # Calculate reconstruction loss
            loss = criterion(reconstructed, batch_X)
            
            # Backward pass and optimize
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
        
        # Print progress every 5 epochs
        if (epoch + 1) % 5 == 0:
            print(f'Epoch {epoch+1}/{epochs}, Loss: {epoch_loss/len(loader):.4f}')
    
    # Generate embeddings for all players
    model.eval()
    with torch.no_grad():
        embeddings, _ = model(X_tensor, pos_tensor)
        embeddings = embeddings.numpy()
    
    return model, embeddings, player_names, position_idx

def visualize_embeddings(embeddings, player_names, position_idx, top_n=20, save_path=None):
    """Visualize player embeddings in 2D space."""
    positions = ['leftWing', 'center', 'goalie', 'rightWing', 'rightDefense', 'leftDefense']
    colors = ['#ff7f0e', '#1f77b4', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
    
    plt.figure(figsize=(12, 10))
    
    # Plot all players
    for i, pos in enumerate(positions):
        mask = position_idx == i
        plt.scatter(embeddings[mask, 0], embeddings[mask, 1], 
                    color=colors[i], label=pos, alpha=0.7)
    
    # Label top players
    war_values = y[:, 0]  # Total WAR values
    top_indices = np.argsort(war_values)[-top_n:]
    
    for idx in top_indices:
        plt.annotate(player_names[idx], 
                     (embeddings[idx, 0], embeddings[idx, 1]),
                     fontsize=9, alpha=0.8)
    
    plt.title('Player Embeddings (2D)', fontsize=14)
    plt.xlabel('Embedding Dimension 1')
    plt.ylabel('Embedding Dimension 2')
    plt.legend()
    plt.grid(alpha=0.3)
    
    if save_path:
        plt.savefig(save_path)
    plt.show()

def find_similar_players(embeddings, player_names, position_idx, query_player, top_n=5):
    """Find players most similar to the query player based on embeddings."""
    query_idx = np.where(player_names == query_player)[0]
    
    if len(query_idx) == 0:
        print(f"Player '{query_player}' not found.")
        return
    
    query_idx = query_idx[0]
    query_embedding = embeddings[query_idx]
    
    # Calculate distances
    distances = np.sqrt(np.sum((embeddings - query_embedding)**2, axis=1))
    
    # Get indices of closest players (excluding the query player)
    closest_indices = np.argsort(distances)[1:top_n+1]
    
    # Position and WAR info
    positions = ['leftWing', 'center', 'goalie', 'rightWing', 'rightDefense', 'leftDefense']
    query_position = positions[position_idx[query_idx]]
    query_war = y[query_idx, 0]
    
    print(f"\nPlayers similar to {query_player} ({query_position}, WAR: {query_war:.2f}):")
    
    for idx in closest_indices:
        player = player_names[idx]
        position = positions[position_idx[idx]]
        war = y[idx, 0]
        similarity = 1 - (distances[idx] / np.max(distances))  # Normalized similarity
        
        print(f"  {player} ({position}) - WAR: {war:.2f}, Similarity: {similarity:.2%}")

def run_pytorch_war_analysis(csv_path='player_war_results.csv', output_dir='pytorch'):
    """Run the complete PyTorch WAR analysis pipeline."""
    print("Starting PyTorch WAR Analysis...")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Load and preprocess data
    global X, y, position_idx, player_names, df, features, targets
    X, y, position_idx, player_names, df, features, targets = load_and_preprocess_data(csv_path)
    
    print(f"Loaded data for {len(player_names)} players")
    
    # Train multi-task model
    print("\n--- Training Position-Aware Multi-Task WAR Model ---")
    multitask_model = train_multitask_model(X, y, position_idx, epochs=50)
    
    # Save model
    torch.save(multitask_model.state_dict(), os.path.join(output_dir, 'multitask_model.pt'))
    
    # Train embedding model
    print("\n--- Training Player Embedding Model ---")
    embedding_model, embeddings, player_names, position_idx = train_embedding_model(X, position_idx, player_names)
    
    # Save model
    torch.save(embedding_model.state_dict(), os.path.join(output_dir, 'embedding_model.pt'))
    
    # Visualize embeddings
    print("\n--- Generating Player Embedding Visualization ---")
    visualize_embeddings(embeddings, player_names, position_idx, save_path=os.path.join(output_dir, 'player_embeddings.png'))
    
    # Find similar players for top performers
    print("\n--- Finding Similar Players ---")
    top_war_indices = np.argsort(y[:, 0])[-5:]  # Top 5 by WAR
    for idx in reversed(top_war_indices):
        find_similar_players(embeddings, player_names, position_idx, player_names[idx])
    
    print("\nPyTorch WAR Analysis complete! Results saved to", output_dir)

if __name__ == "__main__":
    run_pytorch_war_analysis()