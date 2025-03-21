/*
  Warnings:

  - You are about to drop the column `tier_id` on the `TeamSeason` table. All the data in the column will be lost.
  - You are about to drop the `PlayerTierHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tier_bogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tier_commissioners` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[team_identifier,league_id]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `league_id` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `league_season_id` to the `TeamSeason` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeagueType" AS ENUM ('NHL', 'AHL', 'ECHL', 'CHL');

-- CreateEnum
CREATE TYPE "CHLSubLeague" AS ENUM ('OHL', 'QMJHL', 'WHL', 'NAJHL');

-- DropForeignKey
ALTER TABLE "PlayerTierHistory" DROP CONSTRAINT "PlayerTierHistory_player_season_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTierHistory" DROP CONSTRAINT "PlayerTierHistory_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "TeamSeason" DROP CONSTRAINT "TeamSeason_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "Tier" DROP CONSTRAINT "Tier_season_id_fkey";

-- DropForeignKey
ALTER TABLE "tier_bogs" DROP CONSTRAINT "tier_bogs_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "tier_bogs" DROP CONSTRAINT "tier_bogs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tier_commissioners" DROP CONSTRAINT "tier_commissioners_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "tier_commissioners" DROP CONSTRAINT "tier_commissioners_user_id_fkey";

-- DropIndex
DROP INDEX "Team_team_identifier_key";

-- DropIndex
DROP INDEX "TeamSeason_tier_id_idx";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "division_id" TEXT,
ADD COLUMN     "league_id" TEXT NOT NULL,
ADD COLUMN     "logo_path" TEXT,
ADD COLUMN     "primary_color" TEXT,
ADD COLUMN     "secondary_color" TEXT;

-- AlterTable
ALTER TABLE "TeamSeason" DROP COLUMN "tier_id",
ADD COLUMN     "league_season_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "PlayerTierHistory";

-- DropTable
DROP TABLE "Tier";

-- DropTable
DROP TABLE "tier_bogs";

-- DropTable
DROP TABLE "tier_commissioners";

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "leagueType" "LeagueType" NOT NULL,
    "isSubLeague" BOOLEAN NOT NULL DEFAULT false,
    "parent_league_id" TEXT,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueSeason" (
    "id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "salary_cap" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conference_id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_commissioners" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "league_season_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "league_commissioners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "league_bogs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "league_season_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "league_bogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_league_history" (
    "id" TEXT NOT NULL,
    "player_season_id" TEXT NOT NULL,
    "league_season_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_league_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "League_shortName_key" ON "League"("shortName");

-- CreateIndex
CREATE INDEX "LeagueSeason_league_id_idx" ON "LeagueSeason"("league_id");

-- CreateIndex
CREATE INDEX "LeagueSeason_season_id_idx" ON "LeagueSeason"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSeason_league_id_season_id_key" ON "LeagueSeason"("league_id", "season_id");

-- CreateIndex
CREATE UNIQUE INDEX "Conference_name_league_id_key" ON "Conference"("name", "league_id");

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_league_id_key" ON "Division"("name", "league_id");

-- CreateIndex
CREATE INDEX "league_commissioners_user_id_idx" ON "league_commissioners"("user_id");

-- CreateIndex
CREATE INDEX "league_commissioners_league_season_id_idx" ON "league_commissioners"("league_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "league_commissioners_user_id_league_season_id_key" ON "league_commissioners"("user_id", "league_season_id");

-- CreateIndex
CREATE INDEX "league_bogs_user_id_idx" ON "league_bogs"("user_id");

-- CreateIndex
CREATE INDEX "league_bogs_league_season_id_idx" ON "league_bogs"("league_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "league_bogs_user_id_league_season_id_key" ON "league_bogs"("user_id", "league_season_id");

-- CreateIndex
CREATE INDEX "player_league_history_player_season_id_idx" ON "player_league_history"("player_season_id");

-- CreateIndex
CREATE INDEX "player_league_history_league_season_id_idx" ON "player_league_history"("league_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_team_identifier_league_id_key" ON "Team"("team_identifier", "league_id");

-- CreateIndex
CREATE INDEX "TeamSeason_league_season_id_idx" ON "TeamSeason"("league_season_id");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_parent_league_id_fkey" FOREIGN KEY ("parent_league_id") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conference" ADD CONSTRAINT "Conference_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "Conference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_commissioners" ADD CONSTRAINT "league_commissioners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_commissioners" ADD CONSTRAINT "league_commissioners_league_season_id_fkey" FOREIGN KEY ("league_season_id") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_bogs" ADD CONSTRAINT "league_bogs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "league_bogs" ADD CONSTRAINT "league_bogs_league_season_id_fkey" FOREIGN KEY ("league_season_id") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeason" ADD CONSTRAINT "TeamSeason_league_season_id_fkey" FOREIGN KEY ("league_season_id") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_league_history" ADD CONSTRAINT "player_league_history_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "player_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_league_history" ADD CONSTRAINT "player_league_history_league_season_id_fkey" FOREIGN KEY ("league_season_id") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
