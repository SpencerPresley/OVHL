/*
  Warnings:

  - You are about to drop the column `tier_id` on the `PlayerSeason` table. All the data in the column will be lost.
  - Added the required column `season_id` to the `PlayerSeason` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlayerSeason" DROP CONSTRAINT "PlayerSeason_tier_id_fkey";

-- AlterTable
ALTER TABLE "PlayerSeason" DROP COLUMN "tier_id",
ADD COLUMN     "season_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tier" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PlayerTierHistory" (
    "id" TEXT NOT NULL,
    "player_season_id" TEXT NOT NULL,
    "tier_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerTierHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerSeason" ADD CONSTRAINT "PlayerSeason_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTierHistory" ADD CONSTRAINT "PlayerTierHistory_player_season_id_fkey" FOREIGN KEY ("player_season_id") REFERENCES "PlayerSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTierHistory" ADD CONSTRAINT "PlayerTierHistory_tier_id_fkey" FOREIGN KEY ("tier_id") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
