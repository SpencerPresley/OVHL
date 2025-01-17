/*
  Warnings:

  - You are about to drop the `PlayerTeamSeason` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "PlayerMatch" DROP CONSTRAINT "PlayerMatch_player_team_season_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTeamSeason" DROP CONSTRAINT "PlayerTeamSeason_player_season_id_fkey";

-- DropForeignKey
ALTER TABLE "PlayerTeamSeason" DROP CONSTRAINT "PlayerTeamSeason_team_season_id_fkey";

-- DropTable
DROP TABLE "PlayerTeamSeason";

-- CreateTable
CREATE TABLE "player_team_seasons" (
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
    "saves" INTEGER,
    "goalsAgainst" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_team_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "player_team_season_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contracts_player_team_season_id_key" ON "contracts"("player_team_season_id");

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "PlayerSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_team_seasons" ADD CONSTRAINT "player_team_seasons_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_player_team_season_id_fkey" FOREIGN KEY ("player_team_season_id") REFERENCES "player_team_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatch" ADD CONSTRAINT "PlayerMatch_player_team_season_id_fkey" FOREIGN KEY ("player_team_season_id") REFERENCES "player_team_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
