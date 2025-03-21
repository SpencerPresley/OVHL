/*
  Warnings:

  - The primary key for the `GamertagHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `player_id` on the `GamertagHistory` table. All the data in the column will be lost.
  - You are about to drop the column `goals_against` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `goals_for` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `losses` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `matches_played` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `otLosses` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_kill_goals_against` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_kill_opportunities` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `powerplay_goals` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `powerplay_opportunities` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `shots` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `shots_against` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `time_on_attack` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `wins` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the column `assists` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `games_played` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `giveaways` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `goals_against` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `hits` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_minutes` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `player_id` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `plus_minus` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `saves` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `shots` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `takeaways` on the `player_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `assists` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `games_played` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `giveaways` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `goals_against` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `hits` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_minutes` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `plus_minus` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `saves` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `shots` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `takeaways` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `team_managers` table. All the data in the column will be lost.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlayerMatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,team_season_id,role]` on the table `team_managers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `GamertagHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `player_seasons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_season_id` to the `team_managers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'COMMISIONER', 'BOG', 'USER');

-- AlterEnum
ALTER TYPE "VerificationStatus" ADD VALUE 'UNKNOWN';

-- DropForeignKey
ALTER TABLE "GamertagHistory" DROP CONSTRAINT "GamertagHistory_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_team_season_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerMatch" DROP CONSTRAINT "PlayerMatch_match_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerMatch" DROP CONSTRAINT "PlayerMatch_player_team_season_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTierHistory" DROP CONSTRAINT "PlayerTierHistory_player_season_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTierHistory" DROP CONSTRAINT "PlayerTierHistory_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_ahl_affiliate_id_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_nhl_affiliate_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamSeason" DROP CONSTRAINT "TeamSeason_team_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamSeason" DROP CONSTRAINT "TeamSeason_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "Tier" DROP CONSTRAINT "Tier_season_id_fkey";

-- DropForeignKey
ALTER TABLE "bids" DROP CONSTRAINT "bids_contract_id_fkey";

-- DropForeignKey
ALTER TABLE "bids" DROP CONSTRAINT "bids_team_season_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_comments" DROP CONSTRAINT "forum_comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_comments" DROP CONSTRAINT "forum_comments_post_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_comments" DROP CONSTRAINT "forum_comments_quoted_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_followers" DROP CONSTRAINT "forum_followers_post_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_followers" DROP CONSTRAINT "forum_followers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_subscriptions" DROP CONSTRAINT "forum_post_subscriptions_postId_fkey";

-- DropForeignKey
ALTER TABLE "forum_post_subscriptions" DROP CONSTRAINT "forum_post_subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "forum_posts" DROP CONSTRAINT "forum_posts_author_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_reactions" DROP CONSTRAINT "forum_reactions_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_reactions" DROP CONSTRAINT "forum_reactions_post_id_fkey";

-- DropForeignKey
ALTER TABLE "forum_reactions" DROP CONSTRAINT "forum_reactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "player_seasons" DROP CONSTRAINT "player_seasons_contract_id_fkey";

-- DropForeignKey
ALTER TABLE "player_seasons" DROP CONSTRAINT "player_seasons_player_id_fkey";

-- DropForeignKey
ALTER TABLE "player_seasons" DROP CONSTRAINT "player_seasons_season_id_fkey";

-- DropForeignKey
ALTER TABLE "player_team_seasons" DROP CONSTRAINT "player_team_seasons_player_season_id_fkey";

-- DropForeignKey
ALTER TABLE "player_team_seasons" DROP CONSTRAINT "player_team_seasons_team_season_id_fkey";

-- DropForeignKey
ALTER TABLE "psn_profiles" DROP CONSTRAINT "psn_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "team_managers" DROP CONSTRAINT "team_managers_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_managers" DROP CONSTRAINT "team_managers_user_id_fkey";

-- DropIndex
DROP INDEX "team_managers_team_id_idx";

-- DropIndex
DROP INDEX "team_managers_user_id_team_id_role_key";

-- AlterTable
ALTER TABLE "GamertagHistory" DROP CONSTRAINT "GamertagHistory_pkey",
DROP COLUMN "player_id",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "GamertagHistory_pkey" PRIMARY KEY ("user_id", "system");

-- AlterTable
ALTER TABLE "TeamSeason" DROP COLUMN "goals_against",
DROP COLUMN "goals_for",
DROP COLUMN "losses",
DROP COLUMN "matches_played",
DROP COLUMN "otLosses",
DROP COLUMN "penalty_kill_goals_against",
DROP COLUMN "penalty_kill_opportunities",
DROP COLUMN "powerplay_goals",
DROP COLUMN "powerplay_opportunities",
DROP COLUMN "shots",
DROP COLUMN "shots_against",
DROP COLUMN "time_on_attack",
DROP COLUMN "wins";

-- AlterTable
ALTER TABLE "player_seasons" DROP COLUMN "assists",
DROP COLUMN "games_played",
DROP COLUMN "giveaways",
DROP COLUMN "goals",
DROP COLUMN "goals_against",
DROP COLUMN "hits",
DROP COLUMN "penalty_minutes",
DROP COLUMN "player_id",
DROP COLUMN "plus_minus",
DROP COLUMN "saves",
DROP COLUMN "shots",
DROP COLUMN "takeaways",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "player_team_seasons" DROP COLUMN "assists",
DROP COLUMN "games_played",
DROP COLUMN "giveaways",
DROP COLUMN "goals",
DROP COLUMN "goals_against",
DROP COLUMN "hits",
DROP COLUMN "penalty_minutes",
DROP COLUMN "plus_minus",
DROP COLUMN "saves",
DROP COLUMN "shots",
DROP COLUMN "takeaways";

-- AlterTable
ALTER TABLE "team_managers" DROP COLUMN "team_id",
ADD COLUMN     "team_season_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "Player";

-- DropTable
DROP TABLE "PlayerMatch";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "is_super_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_commissioner" BOOLEAN NOT NULL DEFAULT false,
    "is_bog" BOOLEAN NOT NULL DEFAULT false,
    "is_team_manager" BOOLEAN NOT NULL DEFAULT false,
    "passwordResetToken" TEXT,
    "passwordResetTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "current_ea_id" TEXT,
    "active_system" "System",

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ea_id_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ea_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ea_id_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "system" "System" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tier_commissioners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tier_commissioners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tier_bogs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tier_bogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "team_season_id" TEXT NOT NULL,
    "ea_match_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMatchStats" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "club_division" INTEGER NOT NULL,
    "cNhlOnlineGameType" TEXT NOT NULL,
    "goals_against_raw" INTEGER NOT NULL,
    "goals_for_raw" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "score_string" TEXT NOT NULL,
    "winner_by_dnf" INTEGER NOT NULL,
    "winner_by_goalie_dnf" INTEGER NOT NULL,
    "member_string" TEXT NOT NULL,
    "passes_attempted" INTEGER NOT NULL,
    "passes_completed" INTEGER NOT NULL,
    "powerplay_goals" INTEGER NOT NULL,
    "powerplay_opportunities" INTEGER NOT NULL,
    "shots" INTEGER NOT NULL,
    "team_art_abbr" TEXT NOT NULL,
    "team_side" INTEGER NOT NULL,
    "time_on_attack" INTEGER NOT NULL,
    "opponent_club_id" TEXT NOT NULL,
    "opponent_score" INTEGER NOT NULL,
    "opponent_team_art_abbr" TEXT NOT NULL,
    "goals" INTEGER NOT NULL,
    "goals_against" INTEGER NOT NULL,

    CONSTRAINT "ClubMatchStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMatchStatsDetails" (
    "id" TEXT NOT NULL,
    "club_match_stats_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ea_club_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "ClubMatchStatsDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomKit" (
    "id" TEXT NOT NULL,
    "details_id" TEXT NOT NULL,
    "is_custom_team" INTEGER NOT NULL,
    "crest_asset_id" INTEGER NOT NULL,
    "use_base_asset" INTEGER NOT NULL,

    CONSTRAINT "CustomKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubAggregateMatchStats" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "club_level" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "pos_sorted" INTEGER NOT NULL,
    "is_guest" INTEGER NOT NULL,
    "player_dnf" INTEGER NOT NULL,
    "player_level" INTEGER NOT NULL,
    "ea_team_id" INTEGER NOT NULL,
    "team_side" INTEGER NOT NULL,
    "opponent_ea_club_id" INTEGER NOT NULL,
    "opponent_ea_team_id" INTEGER NOT NULL,
    "opponent_score" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "rating_defense" DOUBLE PRECISION NOT NULL,
    "rating_offense" DOUBLE PRECISION NOT NULL,
    "rating_teamplay" DOUBLE PRECISION NOT NULL,
    "toi" INTEGER NOT NULL,
    "toi_seconds" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "blocked_shots" INTEGER NOT NULL,
    "deflections" INTEGER NOT NULL,
    "faceoffs_lost" INTEGER NOT NULL,
    "faceoff_pct" DOUBLE PRECISION NOT NULL,
    "faceoffs_won" INTEGER NOT NULL,
    "giveaways" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL,
    "interceptions" INTEGER NOT NULL,
    "pass_attempts" INTEGER NOT NULL,
    "passes" INTEGER NOT NULL,
    "pass_pct" DOUBLE PRECISION NOT NULL,
    "penalties_drawn" INTEGER NOT NULL,
    "penalty_minutes" INTEGER NOT NULL,
    "skater_pk_clear_zone" INTEGER NOT NULL,
    "plus_minus" INTEGER NOT NULL,
    "possession_seconds" INTEGER NOT NULL,
    "power_play_goals" INTEGER NOT NULL,
    "saucer_passes" INTEGER NOT NULL,
    "short_handed_goals" INTEGER NOT NULL,
    "shot_attempts" INTEGER NOT NULL,
    "shot_on_net_pct" DOUBLE PRECISION NOT NULL,
    "shots" INTEGER NOT NULL,
    "takeaways" INTEGER NOT NULL,
    "breakaway_save_pct" DOUBLE PRECISION NOT NULL,
    "breakaway_saves" INTEGER NOT NULL,
    "breakaway_shots" INTEGER NOT NULL,
    "desperation_saves" INTEGER NOT NULL,
    "goals_against" INTEGER NOT NULL,
    "goals_against_average" DOUBLE PRECISION NOT NULL,
    "penalty_shot_save_pct" DOUBLE PRECISION NOT NULL,
    "penalty_shot_saves" INTEGER NOT NULL,
    "goalie_pk_clear_zone" INTEGER NOT NULL,
    "poke_checks" INTEGER NOT NULL,
    "save_pct" DOUBLE PRECISION NOT NULL,
    "total_saves" INTEGER NOT NULL,
    "total_shots_faced" INTEGER NOT NULL,
    "shutout_periods" INTEGER NOT NULL,

    CONSTRAINT "ClubAggregateMatchStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchAnalytics" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "possession_differential" INTEGER NOT NULL,
    "possession_percentage_home" DOUBLE PRECISION NOT NULL,
    "possession_percentage_away" DOUBLE PRECISION NOT NULL,
    "home_shooting_efficiency" DOUBLE PRECISION NOT NULL,
    "away_shooting_efficiency" DOUBLE PRECISION NOT NULL,
    "home_passing_efficiency" DOUBLE PRECISION NOT NULL,
    "away_passing_efficiency" DOUBLE PRECISION NOT NULL,
    "home_possession_efficiency" DOUBLE PRECISION NOT NULL,
    "away_possession_efficiency" DOUBLE PRECISION NOT NULL,
    "home_power_play_pct" DOUBLE PRECISION NOT NULL,
    "away_power_play_pct" DOUBLE PRECISION NOT NULL,
    "home_penalty_kill_pct" DOUBLE PRECISION NOT NULL,
    "away_penalty_kill_pct" DOUBLE PRECISION NOT NULL,
    "home_score" DOUBLE PRECISION NOT NULL,
    "away_score" DOUBLE PRECISION NOT NULL,
    "shot_differential" INTEGER NOT NULL,
    "hit_differential" INTEGER NOT NULL,
    "takeaway_differential" INTEGER NOT NULL,
    "scoring_chances_differential" INTEGER NOT NULL,

    CONSTRAINT "MatchAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_matches" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_team_season_id" TEXT NOT NULL,
    "player_season_id" TEXT NOT NULL,
    "player_level" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "pos_sorted" INTEGER NOT NULL,
    "player_name" TEXT NOT NULL,
    "client_platform" TEXT NOT NULL,
    "player_level_display" INTEGER NOT NULL,
    "is_guest" BOOLEAN NOT NULL,
    "player_dnf" BOOLEAN NOT NULL,
    "pNhlOnlineGameType" TEXT NOT NULL,
    "ea_team_id" TEXT NOT NULL,
    "team_side" INTEGER NOT NULL,
    "opponent_club_id" TEXT NOT NULL,
    "opponent_ea_team_id" TEXT NOT NULL,
    "opponent_score" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "rating_defense" DOUBLE PRECISION NOT NULL,
    "rating_offense" DOUBLE PRECISION NOT NULL,
    "rating_teamplay" DOUBLE PRECISION NOT NULL,
    "toi" INTEGER NOT NULL,
    "toi_seconds" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "blocked_shots" INTEGER NOT NULL,
    "deflections" INTEGER NOT NULL,
    "faceoffs_lost" INTEGER NOT NULL,
    "faceoff_pct" DOUBLE PRECISION NOT NULL,
    "faceoffs_won" INTEGER NOT NULL,
    "giveaways" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "game_winning_goals" INTEGER NOT NULL,
    "hits" INTEGER NOT NULL,
    "interceptions" INTEGER NOT NULL,
    "pass_attempts" INTEGER NOT NULL,
    "passes" INTEGER NOT NULL,
    "pass_pct" DOUBLE PRECISION NOT NULL,
    "penalties_drawn" INTEGER NOT NULL,
    "penalty_minutes" INTEGER NOT NULL,
    "skater_pk_clear_zone" INTEGER NOT NULL,
    "plus_minus" INTEGER NOT NULL,
    "possession_seconds" INTEGER NOT NULL,
    "power_play_goals" INTEGER NOT NULL,
    "saucer_passes" INTEGER NOT NULL,
    "short_handed_goals" INTEGER NOT NULL,
    "shot_attempts" INTEGER NOT NULL,
    "shots_on_net_pct" DOUBLE PRECISION NOT NULL,
    "shooting_pct" DOUBLE PRECISION NOT NULL,
    "shots_on_goal" INTEGER NOT NULL,
    "takeaways" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "faceoffs_total" INTEGER NOT NULL,
    "shots_missed" INTEGER NOT NULL,
    "passes_missed" INTEGER NOT NULL,
    "passing_pct" DOUBLE PRECISION NOT NULL,
    "major_penalties" INTEGER NOT NULL,
    "minor_penalties" INTEGER NOT NULL,
    "total_penalties" INTEGER NOT NULL,
    "points_per_60" DOUBLE PRECISION NOT NULL,
    "possession_per_minute" DOUBLE PRECISION NOT NULL,
    "shot_efficiency" DOUBLE PRECISION NOT NULL,
    "tkaway_gvaway_ratio" DOUBLE PRECISION NOT NULL,
    "penalty_differential" INTEGER NOT NULL,
    "def_actions_per_minute" DOUBLE PRECISION NOT NULL,
    "off_impact" DOUBLE PRECISION NOT NULL,
    "def_impact" DOUBLE PRECISION NOT NULL,
    "detailed_position" TEXT NOT NULL,
    "position_abbreviation" TEXT NOT NULL,
    "game_impact_score" DOUBLE PRECISION NOT NULL,
    "puck_management_rating" DOUBLE PRECISION NOT NULL,
    "possession_efficiency" DOUBLE PRECISION NOT NULL,
    "net_def_contribution" DOUBLE PRECISION NOT NULL,
    "time_adjusted_rating" DOUBLE PRECISION NOT NULL,
    "shot_generation_rate" DOUBLE PRECISION NOT NULL,
    "off_zone_presence" DOUBLE PRECISION NOT NULL,
    "two_way_rating" DOUBLE PRECISION NOT NULL,
    "breakaway_save_pct" DOUBLE PRECISION NOT NULL,
    "breakaway_saves" INTEGER NOT NULL,
    "breakaway_shots_faced" INTEGER NOT NULL,
    "desperation_saves" INTEGER NOT NULL,
    "goals_against" INTEGER NOT NULL,
    "goals_against_average" DOUBLE PRECISION NOT NULL,
    "penalty_shot_save_pct" DOUBLE PRECISION NOT NULL,
    "penalty_shot_saves" INTEGER NOT NULL,
    "penalty_shots_faced" INTEGER NOT NULL,
    "goalie_pk_clear_zone" INTEGER NOT NULL,
    "poke_checks" INTEGER NOT NULL,
    "save_pct" DOUBLE PRECISION NOT NULL,
    "total_saves" INTEGER NOT NULL,
    "total_shots_faced" INTEGER NOT NULL,
    "shutout_periods" INTEGER NOT NULL,
    "goals_saved" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MatchToPlayerSeason" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MatchToPlayerSeason_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- CreateIndex
CREATE INDEX "ea_id_history_user_id_idx" ON "ea_id_history"("user_id");

-- CreateIndex
CREATE INDEX "system_history_user_id_idx" ON "system_history"("user_id");

-- CreateIndex
CREATE INDEX "tier_commissioners_user_id_idx" ON "tier_commissioners"("user_id");

-- CreateIndex
CREATE INDEX "tier_commissioners_tier_id_idx" ON "tier_commissioners"("tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "tier_commissioners_user_id_tier_id_key" ON "tier_commissioners"("user_id", "tier_id");

-- CreateIndex
CREATE INDEX "tier_bogs_user_id_idx" ON "tier_bogs"("user_id");

-- CreateIndex
CREATE INDEX "tier_bogs_tier_id_idx" ON "tier_bogs"("tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "tier_bogs_user_id_tier_id_key" ON "tier_bogs"("user_id", "tier_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMatchStatsDetails_club_match_stats_id_key" ON "ClubMatchStatsDetails"("club_match_stats_id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomKit_details_id_key" ON "CustomKit"("details_id");

-- CreateIndex
CREATE INDEX "player_matches_player_season_id_idx" ON "player_matches"("player_season_id");

-- CreateIndex
CREATE INDEX "_MatchToPlayerSeason_B_index" ON "_MatchToPlayerSeason"("B");

-- CreateIndex
CREATE INDEX "team_managers_team_season_id_idx" ON "team_managers"("team_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_managers_user_id_team_season_id_role_key" ON "team_managers"("user_id", "team_season_id", "role");

-- AddForeignKey
ALTER TABLE "ea_id_history" ADD CONSTRAINT "ea_id_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_history" ADD CONSTRAINT "system_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamertagHistory" ADD CONSTRAINT "GamertagHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tier" ADD CONSTRAINT "Tier_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_commissioners" ADD CONSTRAINT "tier_commissioners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_commissioners" ADD CONSTRAINT "tier_commissioners_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_bogs" ADD CONSTRAINT "tier_bogs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_bogs" ADD CONSTRAINT "tier_bogs_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_nhl_affiliate_id_fkey" FOREIGN KEY ("nhl_affiliate_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ahl_affiliate_id_fkey" FOREIGN KEY ("ahl_affiliate_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTierHistory" ADD CONSTRAINT "PlayerTierHistory_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "player_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTierHistory" ADD CONSTRAINT "PlayerTierHistory_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "player_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMatchStats" ADD CONSTRAINT "ClubMatchStats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMatchStatsDetails" ADD CONSTRAINT "ClubMatchStatsDetails_club_match_stats_id_fkey" FOREIGN KEY ("club_match_stats_id") REFERENCES "ClubMatchStats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomKit" ADD CONSTRAINT "CustomKit_details_id_fkey" FOREIGN KEY ("details_id") REFERENCES "ClubMatchStatsDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubAggregateMatchStats" ADD CONSTRAINT "ClubAggregateMatchStats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchAnalytics" ADD CONSTRAINT "MatchAnalytics_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_matches" ADD CONSTRAINT "player_matches_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_matches" ADD CONSTRAINT "player_matches_player_team_season_id_fkey" FOREIGN KEY ("player_team_season_id") REFERENCES "player_team_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_matches" ADD CONSTRAINT "player_matches_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "player_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_followers" ADD CONSTRAINT "forum_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_followers" ADD CONSTRAINT "forum_followers_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_subscriptions" ADD CONSTRAINT "forum_post_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_subscriptions" ADD CONSTRAINT "forum_post_subscriptions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_quoted_comment_id_fkey" FOREIGN KEY ("quoted_comment_id") REFERENCES "forum_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_managers" ADD CONSTRAINT "team_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_managers" ADD CONSTRAINT "team_managers_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_profiles" ADD CONSTRAINT "psn_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchToPlayerSeason" ADD CONSTRAINT "_MatchToPlayerSeason_A_fkey" FOREIGN KEY ("A") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchToPlayerSeason" ADD CONSTRAINT "_MatchToPlayerSeason_B_fkey" FOREIGN KEY ("B") REFERENCES "player_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
