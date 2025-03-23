import pandas as pd

df = pd.read_csv("outputs/player_stats.csv")

print(df.head())

position_groups = df.groupby("detailed_position")

for position, group in position_groups:
    print(f"Position: {position}")
    print(group.head())
    input()
    