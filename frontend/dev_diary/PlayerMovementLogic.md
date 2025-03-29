# Player Movement Logic

When moving a player between leagues (e.g., CHL to AHL call-up):

## Scenario 1

### 1. CHL actions

- **Update CHL PlayerTeamSeason:**
  - Set `isInactive = true`
  - Set `isRosterPlayer = false`
  - Set `isTrainingCamp = false`
  - Set `inactiveTeamId = chlTeamId`
  - Set `rosterTeamId = null`
  - Set `trainingCampTeamId = null`
- **Update CHL TeamSeason relations:**
  - Remove from `rosterPlayers`
  - Add to `inactivePlayers`

### 2. ECHL actions

- **Update ECHL PlayerTeamSeason:**
  - Set `isInactive = true`
  - Set `isRosterPlayer = false`
  - Set `isTrainingCamp = false`
  - Set `inactiveTeamId = echlTeamId`
  - Set `rosterTeamId = null`
  - Set `trainingCampTeamId = null`
- **Update ECHL TeamSeason relations:**
  - Remove from wherever they were
  - Add to `inactivePlayers`

### 3. AHL actions

- **Update AHL PlayerTeamSeason:**
  - Set `isRosterPlayer = true`
  - Set `isTrainingCamp = false`
  - Set `isInactive = false`
  - Set `rosterTeamId = ahlTeamId`
  - Set `trainingCampTeamId = null`
  - Set `inactiveTeamId = null`
- **Update AHL TeamSeason relations:**
  - Remove from `trainingCampPlayers` or `inactivePlayers` (if they were there)
  - Add to `rosterPlayers`

### 4. NHL actions

- No change needed if already a training camp player
- (Assuming they're staying in NHL training camp)

### 5. Update PlayerLeagueHistory

- Close any open records for other leagues (set endDate)
- Create new record for AHL

## Additional Player Movement Scenarios

### AHL sends player down to ECHL

- **Update AHL PlayerTeamSeason:**
  - Set `isInactive = false`
  - Set `isRosterPlayer = false`
  - Set `isTrainingCamp = true`
  - Set `rosterTeamId = null`
  - Set `trainingCampTeamId = ahlTeamId`
  - Set `inactiveTeamId = null`
- **Update AHL TeamSeason relations:**
  - Remove from `rosterPlayers`
  - Add to `trainingCampPlayers`
- **Update ECHL PlayerTeamSeason:**
  - Set `isInactive = false`
  - Set `isRosterPlayer = true`
  - Set `isTrainingCamp = false`
  - Set `rosterTeamId = echlTeamId`
  - Set `trainingCampTeamId = null`
  - Set `inactiveTeamId = null`
- **Update ECHL TeamSeason relations:**
  - Remove from `inactivePlayers`
  - Add to `rosterPlayers`
- **Update PlayerLeagueHistory:**
  - Close AHL record (set endDate)
  - Create new ECHL record

### ECHL player called back up to AHL

- **Follow original CHL to AHL pattern but with ECHL instead of CHL**
- **Update ECHL PlayerTeamSeason:**
  - Set `isInactive = true`
  - Set `isRosterPlayer = false`
  - Set `isTrainingCamp = false`
  - Set `inactiveTeamId = echlTeamId`
  - Set `rosterTeamId = null`
  - Set `trainingCampTeamId = null`
- **Update AHL PlayerTeamSeason:**
  - Set `isRosterPlayer = true`
  - Set `isTrainingCamp = false`
  - Set `isInactive = false`
  - Set `rosterTeamId = ahlTeamId`
  - Set `trainingCampTeamId = null`
  - Set `inactiveTeamId = null`
- **Update PlayerLeagueHistory:**
  - Close ECHL record
  - Create/reopen AHL record

### AHL player traded to different AHL team (new NHL organization)

- **Old AHL team actions:**
  - Remove player from `rosterPlayers`
- **New AHL team actions:**
  - Add player to `rosterPlayers`
- **Update AHL PlayerTeamSeason:**
  - Keep `isRosterPlayer = true`
  - Set `teamSeasonId = newAhlTeamId`
  - Set `rosterTeamId = newAhlTeamId`
- **NHL organization changes:**
  - Update NHL PlayerTeamSeason to point to new NHL affiliate
  - If was NHL training camp player, move to new NHL team's `trainingCampPlayers`
- **ECHL organization changes:**
  - Update ECHL PlayerTeamSeason to point to new ECHL affiliate
  - Keep as `inactivePlayers` if previously inactive
- **Update PlayerLeagueHistory:**
  - No league change, but may want to record team change in metadata

### AHL player called up to NHL

- **AHL actions:**
  - Set `isInactive = true`
  - Set `isRosterPlayer = false`
  - Remove from `rosterPlayers`
  - Add to `inactivePlayers`
- **NHL actions:**
  - Set `isRosterPlayer = true`
  - Set `isTrainingCamp = false`
  - Remove from `trainingCampPlayers` if they were there
  - Add to `rosterPlayers`
- **Update PlayerLeagueHistory:**
  - Close AHL record
  - Create NHL record

### NHL player traded to different NHL team

- **Old NHL team actions:**
  - Remove player from `rosterPlayers`
- **New NHL team actions:**
  - Add player to `rosterPlayers`
- **Update NHL PlayerTeamSeason:**
  - Keep `isRosterPlayer = true`
  - Set `teamSeasonId = newNhlTeamId`
  - Set `rosterTeamId = newNhlTeamId`
- **AHL/ECHL affiliates changes:**
  - Update AHL PlayerTeamSeason to point to new NHL affiliate's AHL team
  - Update ECHL PlayerTeamSeason to point to new NHL affiliate's ECHL team
  - Both remain in respective `inactivePlayers` arrays
- **Update CHL PlayerTeamSeason:**
  - No change needed (CHL teams aren't affected by NHL trades)
- **Update PlayerLeagueHistory:**
  - No league change, but may want to record team change in metadata

## Idea

TeamSeason

-> Array of roster players
-> Array of training camp players
-> Array of inactive players (could probably just be a flag: isPlayable)

User:
Has array of player season models that represent data from
each season they've been in

PlayerTeamSeason:
data specific to a players performance/stats on a particular team during the season

Caps -> PlayerTeamSeason
Canucks -> PlayerTeamSeason

What if this person gets sent down?

TC player for their nhl team
but a roster player for their AHL team
and you'd need playerteamseasons for all:

Caps (ROSTER)
Canucks (ROSTER)
--- sent down ---
AHLCanucks (ROSTER)
CanucksAsTC (TRAINING CAMP)
--- AHL TRADES THEM TO MARLIES ---
Marlies PTS
Maple Leafs PTS (as a tc)
(MPL Call them up)
Maple Leafs PTS (as roster)
