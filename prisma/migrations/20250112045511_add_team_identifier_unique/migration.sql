/*
  Warnings:

  - A unique constraint covering the columns `[team_identifier]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Team_team_identifier_key" ON "Team"("team_identifier");
