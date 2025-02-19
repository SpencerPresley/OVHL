/*
  Warnings:

  - You are about to drop the column `player_season_id` on the `contracts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contract_id]` on the table `player_seasons` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contract_id` to the `player_seasons` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "contracts" DROP CONSTRAINT "contracts_player_season_id_fkey";

-- DropIndex
DROP INDEX "contracts_player_season_id_key";

-- AlterTable
ALTER TABLE "contracts" DROP COLUMN "player_season_id";

-- AlterTable
ALTER TABLE "player_seasons" ADD COLUMN     "contract_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "player_seasons_contract_id_key" ON "player_seasons"("contract_id");

-- AddForeignKey
ALTER TABLE "player_seasons" ADD CONSTRAINT "player_seasons_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
