/*
  Warnings:

  - You are about to drop the column `player_id` on the `contracts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[player_season_id]` on the table `contracts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `player_season_id` to the `contracts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_player_id_fkey";

-- DropIndex
DROP INDEX "contracts_player_id_key";

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "player_id",
ADD COLUMN     "player_season_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "player_seasons" ALTER COLUMN "assists" DROP NOT NULL,
ALTER COLUMN "assists" DROP DEFAULT,
ALTER COLUMN "games_played" DROP NOT NULL,
ALTER COLUMN "games_played" DROP DEFAULT,
ALTER COLUMN "giveaways" DROP NOT NULL,
ALTER COLUMN "giveaways" DROP DEFAULT,
ALTER COLUMN "goals" DROP NOT NULL,
ALTER COLUMN "goals" DROP DEFAULT,
ALTER COLUMN "hits" DROP NOT NULL,
ALTER COLUMN "hits" DROP DEFAULT,
ALTER COLUMN "penalty_minutes" DROP NOT NULL,
ALTER COLUMN "penalty_minutes" DROP DEFAULT,
ALTER COLUMN "plus_minus" DROP NOT NULL,
ALTER COLUMN "plus_minus" DROP DEFAULT,
ALTER COLUMN "shots" DROP NOT NULL,
ALTER COLUMN "shots" DROP DEFAULT,
ALTER COLUMN "takeaways" DROP NOT NULL,
ALTER COLUMN "takeaways" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "contracts_player_season_id_key" ON "contracts"("player_season_id");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "player_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
