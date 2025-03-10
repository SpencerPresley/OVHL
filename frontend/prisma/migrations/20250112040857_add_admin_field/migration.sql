-- CreateEnum
CREATE TYPE "System" AS ENUM ('PS', 'XBOX');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "ea_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active_system" "System" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamertagHistory" (
    "player_id" TEXT NOT NULL,
    "system" "System" NOT NULL,
    "gamertag" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamertagHistory_pkey" PRIMARY KEY ("player_id","system")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "is_latest" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tier" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "league_level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "ea_club_id" TEXT NOT NULL,
    "ea_club_name" TEXT NOT NULL,
    "official_name" TEXT NOT NULL,
    "team_identifier" VARCHAR(14) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSeason" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "otLosses" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "penalty_kill_goals_against" INTEGER NOT NULL DEFAULT 0,
    "penalty_kill_opportunities" INTEGER NOT NULL DEFAULT 0,
    "powerplay_goals" INTEGER NOT NULL DEFAULT 0,
    "powerplay_opportunities" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "shots_against" INTEGER NOT NULL DEFAULT 0,
    "time_on_attack" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSeason" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "position" VARCHAR(13) NOT NULL,
    "is_active_manager" BOOLEAN NOT NULL DEFAULT false,
    "manager_role" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tier_id" TEXT NOT NULL,

    CONSTRAINT "PlayerSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTeamSeason" (
    "id" TEXT NOT NULL,
    "player_season_id" TEXT NOT NULL,
    "team_season_id" TEXT NOT NULL,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "games_played" INTEGER NOT NULL DEFAULT 0,
    "giveaways" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "penalty_minutes" INTEGER NOT NULL DEFAULT 0,
    "plus_minus" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "takeaways" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerTeamSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "team_season_id" TEXT NOT NULL,
    "ea_match_id" TEXT NOT NULL,
    "goals_against" INTEGER NOT NULL,
    "goals_for" INTEGER NOT NULL,
    "opponent_club_id" TEXT NOT NULL,
    "opponent_team_id" TEXT NOT NULL,
    "penalty_kill_goals_against" INTEGER NOT NULL,
    "penalty_kill_opportunities" INTEGER NOT NULL,
    "powerplay_goals" INTEGER NOT NULL,
    "powerplay_opportunities" INTEGER NOT NULL,
    "shots" INTEGER NOT NULL,
    "shots_against" INTEGER NOT NULL,
    "time_on_attack" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMatch" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_team_season_id" TEXT NOT NULL,
    "assists" INTEGER NOT NULL,
    "giveaways" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL,
    "penalty_minutes" INTEGER NOT NULL,
    "plus_minus" INTEGER NOT NULL,
    "rating_defense" DOUBLE PRECISION NOT NULL,
    "rating_offense" DOUBLE PRECISION NOT NULL,
    "rating_teamplay" DOUBLE PRECISION NOT NULL,
    "shots" INTEGER NOT NULL,
    "takeaways" INTEGER NOT NULL,
    "time_on_ice" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerMatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamertagHistory" ADD CONSTRAINT "GamertagHistory_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tier" ADD CONSTRAINT "Tier_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeason" ADD CONSTRAINT "PlayerSeason_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSeason" ADD CONSTRAINT "PlayerSeason_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTeamSeason" ADD CONSTRAINT "PlayerTeamSeason_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "PlayerSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTeamSeason" ADD CONSTRAINT "PlayerTeamSeason_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatch" ADD CONSTRAINT "PlayerMatch_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatch" ADD CONSTRAINT "PlayerMatch_player_team_season_id_fkey" FOREIGN KEY ("player_team_season_id") REFERENCES "PlayerTeamSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
