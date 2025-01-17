/*
  Warnings:

  - You are about to drop the column `player_team_season_id` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `goalsAgainst` on the `player_team_seasons` table. All the data in the column will be lost.
  - You are about to drop the `PlayerSeason` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[player_id]` on the table `contracts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `player_id` to the `contracts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlayerSeason" DROP CONSTRAINT "PlayerSeason_player_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerSeason" DROP CONSTRAINT "PlayerSeason_season_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTierHistory" DROP CONSTRAINT "PlayerTierHistory_player_season_id_fkey";

-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_player_team_season_id_fkey";

-- DropForeignKey
ALTER TABLE "player_team_seasons" DROP CONSTRAINT "player_team_seasons_player_season_id_fkey";

-- DropIndex
DROP INDEX "contracts_player_team_season_id_key";

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "player_team_season_id",
ADD COLUMN     "player_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "player_team_seasons" DROP COLUMN "goalsAgainst",
ADD COLUMN     "goals_against" INTEGER;

-- DropTable
DROP TABLE "PlayerSeason";

-- CreateTable
CREATE TABLE "player_seasons" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "games_played" INTEGER NOT NULL DEFAULT 0,
    "giveaways" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "penalty_minutes" INTEGER NOT NULL DEFAULT 0,
    "plus_minus" INTEGER NOT NULL DEFAULT 0,
    "shots" INTEGER NOT NULL DEFAULT 0,
    "takeaways" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER,
    "goals_against" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contracts_player_id_key" ON "contracts"("player_id");

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTierHistory" ADD CONSTRAINT "PlayerTierHistory_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "player_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "player_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
