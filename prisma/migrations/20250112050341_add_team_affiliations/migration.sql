-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "ahl_affiliate_id" TEXT,
ADD COLUMN     "nhl_affiliate_id" TEXT;

-- CreateIndex
CREATE INDEX "Team_nhl_affiliate_id_idx" ON "Team"("nhl_affiliate_id");

-- CreateIndex
CREATE INDEX "Team_ahl_affiliate_id_idx" ON "Team"("ahl_affiliate_id");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_nhl_affiliate_id_fkey" FOREIGN KEY ("nhl_affiliate_id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ahl_affiliate_id_fkey" FOREIGN KEY ("ahl_affiliate_id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
