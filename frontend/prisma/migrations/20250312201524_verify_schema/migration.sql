/*
  Warnings:

  - Added the required column `updated_at` to the `GamertagHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "PSNSyncType" AS ENUM ('PROFILE', 'TROPHIES', 'GAMES', 'ALL');

-- CreateEnum
CREATE TYPE "PSNSyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "GamertagHistory" ADD COLUMN     "code_expires_at" TIMESTAMP(3),
ADD COLUMN     "code_generated_at" TIMESTAMP(3),
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_attempt_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verification_attempts" INTEGER DEFAULT 0,
ADD COLUMN     "verification_code" TEXT,
ADD COLUMN     "verification_metadata" JSONB,
ADD COLUMN     "verification_status" "VerificationStatus",
ADD COLUMN     "verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "psn_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "online_id" TEXT NOT NULL,
    "account_id" TEXT,
    "about_me" TEXT,
    "languages" TEXT[],
    "is_plus" BOOLEAN DEFAULT false,
    "is_officially_verified" BOOLEAN DEFAULT false,
    "friends_count" INTEGER,
    "mutual_friends_count" INTEGER,
    "friend_relation" TEXT,
    "is_blocking" BOOLEAN DEFAULT false,
    "online_status" TEXT,
    "platform" TEXT,
    "last_online" TIMESTAMP(3),
    "availability" TEXT,
    "last_profile_sync" TIMESTAMP(3),
    "last_trophy_sync" TIMESTAMP(3),
    "last_game_sync" TIMESTAMP(3),
    "sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_avatars" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_avatars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_trophies" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "trophy_level" INTEGER,
    "progress" INTEGER,
    "tier" INTEGER,
    "platinum_count" INTEGER,
    "gold_count" INTEGER,
    "silver_count" INTEGER,
    "bronze_count" INTEGER,
    "total_trophies" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_trophies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_games" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "image_url" TEXT,
    "play_count" INTEGER,
    "first_played" TIMESTAMP(3),
    "last_played" TIMESTAMP(3),
    "play_duration" TEXT,
    "play_time_minutes" INTEGER,
    "is_currently_playing" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_sync_logs" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "sync_type" "PSNSyncType" NOT NULL,
    "status" "PSNSyncStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "records_updated" INTEGER DEFAULT 0,

    CONSTRAINT "psn_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psn_game_trophies" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "trophies_earned" INTEGER NOT NULL DEFAULT 0,
    "trophies_total" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER,
    "platinum_earned" INTEGER DEFAULT 0,
    "gold_earned" INTEGER DEFAULT 0,
    "silver_earned" INTEGER DEFAULT 0,
    "bronze_earned" INTEGER DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psn_game_trophies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "psn_profiles_user_id_key" ON "psn_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "psn_profiles_online_id_key" ON "psn_profiles"("online_id");

-- CreateIndex
CREATE INDEX "psn_profiles_online_id_idx" ON "psn_profiles"("online_id");

-- CreateIndex
CREATE INDEX "psn_avatars_profile_id_idx" ON "psn_avatars"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "psn_avatars_profile_id_size_key" ON "psn_avatars"("profile_id", "size");

-- CreateIndex
CREATE UNIQUE INDEX "psn_trophies_profile_id_key" ON "psn_trophies"("profile_id");

-- CreateIndex
CREATE INDEX "psn_trophies_profile_id_idx" ON "psn_trophies"("profile_id");

-- CreateIndex
CREATE INDEX "psn_games_profile_id_idx" ON "psn_games"("profile_id");

-- CreateIndex
CREATE INDEX "psn_games_title_id_idx" ON "psn_games"("title_id");

-- CreateIndex
CREATE UNIQUE INDEX "psn_games_profile_id_title_id_platform_key" ON "psn_games"("profile_id", "title_id", "platform");

-- CreateIndex
CREATE INDEX "psn_sync_logs_profile_id_idx" ON "psn_sync_logs"("profile_id");

-- CreateIndex
CREATE INDEX "psn_sync_logs_sync_type_idx" ON "psn_sync_logs"("sync_type");

-- CreateIndex
CREATE INDEX "psn_sync_logs_status_idx" ON "psn_sync_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "psn_game_trophies_game_id_key" ON "psn_game_trophies"("game_id");

-- CreateIndex
CREATE INDEX "psn_game_trophies_profile_id_idx" ON "psn_game_trophies"("profile_id");

-- CreateIndex
CREATE INDEX "GamertagHistory_gamertag_system_idx" ON "GamertagHistory"("gamertag", "system");

-- CreateIndex
CREATE INDEX "GamertagHistory_verification_code_idx" ON "GamertagHistory"("verification_code");

-- AddForeignKey
ALTER TABLE "psn_profiles" ADD CONSTRAINT "psn_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_avatars" ADD CONSTRAINT "psn_avatars_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "psn_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_trophies" ADD CONSTRAINT "psn_trophies_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "psn_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_games" ADD CONSTRAINT "psn_games_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "psn_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_sync_logs" ADD CONSTRAINT "psn_sync_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "psn_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_game_trophies" ADD CONSTRAINT "psn_game_trophies_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "psn_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psn_game_trophies" ADD CONSTRAINT "psn_game_trophies_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "psn_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
