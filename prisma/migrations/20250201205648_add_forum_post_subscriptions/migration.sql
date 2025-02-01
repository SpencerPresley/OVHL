/*
  Warnings:

  - You are about to drop the column `quoted_post_id` on the `forum_comments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "forum_comments_quoted_comment_id_idx";

-- AlterTable
ALTER TABLE "forum_comments" DROP COLUMN "quoted_post_id",
ADD COLUMN     "gif" JSONB;

-- AlterTable
ALTER TABLE "forum_posts" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "leagues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "banner_color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_post_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_post_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forum_post_subscriptions_userId_idx" ON "forum_post_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "forum_post_subscriptions_postId_idx" ON "forum_post_subscriptions"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "forum_post_subscriptions_userId_postId_key" ON "forum_post_subscriptions"("userId", "postId");

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_subscriptions" ADD CONSTRAINT "forum_post_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_post_subscriptions" ADD CONSTRAINT "forum_post_subscriptions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
