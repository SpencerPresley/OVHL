/*
  Warnings:

  - The values [NAJHL] on the enum `CHLSubLeague` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `inactive_team_id` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `is_inactive_player` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `is_roster_player` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `roster_team_id` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the column `training_camp_team_id` on the `player_team_seasons` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CHLSubLeague_new" AS ENUM ('OHL', 'QMJHL', 'WHL');
ALTER TYPE "CHLSubLeague" RENAME TO "CHLSubLeague_old";
ALTER TYPE "CHLSubLeague_new" RENAME TO "CHLSubLeague";
DROP TYPE "CHLSubLeague_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "player_team_seasons" DROP CONSTRAINT "player_team_seasons_inactive_team_id_fkey";

-- DropForeignKey
ALTER TABLE "player_team_seasons" DROP CONSTRAINT "player_team_seasons_roster_team_id_fkey";

-- DropForeignKey
ALTER TABLE "player_team_seasons" DROP CONSTRAINT "player_team_seasons_training_camp_team_id_fkey";

-- AlterTable
ALTER TABLE "Conference" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Division" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "player_team_seasons" DROP COLUMN "inactive_team_id",
DROP COLUMN "is_inactive_player",
DROP COLUMN "is_roster_player",
DROP COLUMN "roster_team_id",
DROP COLUMN "training_camp_team_id",
ADD COLUMN     "is_playable" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
