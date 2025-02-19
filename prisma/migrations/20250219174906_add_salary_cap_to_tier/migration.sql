/*
  Warnings:

  - You are about to drop the column `team_id` on the `bids` table. All the data in the column will be lost.
  - Added the required column `team_season_id` to the `bids` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamSeason" ADD COLUMN     "defense_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "forward_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goalie_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Tier" ADD COLUMN     "salary_cap" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "bids" DROP COLUMN "team_id",
ADD COLUMN     "team_season_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "TeamSeason_team_id_idx" ON "TeamSeason"("team_id");

-- CreateIndex
CREATE INDEX "TeamSeason_tier_id_idx" ON "TeamSeason"("tier_id");

-- CreateIndex
CREATE INDEX "Tier_season_id_idx" ON "Tier"("season_id");

-- CreateIndex
CREATE INDEX "bids_contract_id_idx" ON "bids"("contract_id");

-- CreateIndex
CREATE INDEX "bids_team_season_id_idx" ON "bids"("team_season_id");

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_team_season_id_fkey" FOREIGN KEY ("team_season_id") REFERENCES "TeamSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
