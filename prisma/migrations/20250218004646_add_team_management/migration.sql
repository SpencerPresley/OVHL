-- CreateEnum
CREATE TYPE "TeamManagementRole" AS ENUM ('OWNER', 'GM', 'AGM', 'PAGM');

-- CreateTable
CREATE TABLE "team_managers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" "TeamManagementRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_managers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_managers_user_id_idx" ON "team_managers"("user_id");

-- CreateIndex
CREATE INDEX "team_managers_team_id_idx" ON "team_managers"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_managers_user_id_team_id_role_key" ON "team_managers"("user_id", "team_id", "role");

-- AddForeignKey
ALTER TABLE "team_managers" ADD CONSTRAINT "team_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_managers" ADD CONSTRAINT "team_managers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
