/*
  Warnings:

  - The values [COMMISIONER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `season_id` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `official_name` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `team_identifier` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `player_seasons` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[team_abbreviation,league_id]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `season_number` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_team_name` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_abbreviation` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_group` to the `player_seasons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_position` to the `player_seasons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `league_type` to the `player_team_seasons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PositionGroup" AS ENUM ('FORWARD', 'DEFENSE', 'GOALIE');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('LW', 'C', 'RW', 'LD', 'RD', 'G', 'ECU');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'COMMISSIONER', 'BOG', 'USER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "player_team_seasons" DROP CONSTRAINT "player_team_seasons_team_season_id_fkey";

-- DropIndex
DROP INDEX "Team_team_identifier_league_id_key";

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "season_id",
ADD COLUMN     "season_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "official_name",
DROP COLUMN "team_identifier",
ADD COLUMN     "full_team_name" TEXT NOT NULL,
ADD COLUMN     "team_abbreviation" VARCHAR(14) NOT NULL;

-- AlterTable
ALTER TABLE "player_seasons" DROP COLUMN "position",
ADD COLUMN     "position_group" "PositionGroup" NOT NULL,
ADD COLUMN     "primary_position" "PlayerPosition" NOT NULL;

-- AlterTable
ALTER TABLE "player_team_seasons" ADD COLUMN     "inactive_team_id" TEXT,
ADD COLUMN     "is_inactive_player" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_roster_player" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_training_camp_player" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "league_type" "LeagueType" NOT NULL,
ADD COLUMN     "roster_team_id" TEXT,
ADD COLUMN     "training_camp_team_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_team_abbreviation_league_id_key" ON "Team"("team_abbreviation", "league_id");

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_roster_team_id_fkey" FOREIGN KEY ("roster_team_id") REFERENCES "TeamSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_training_camp_team_id_fkey" FOREIGN KEY ("training_camp_team_id") REFERENCES "TeamSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_inactive_team_id_fkey" FOREIGN KEY ("inactive_team_id") REFERENCES "TeamSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
