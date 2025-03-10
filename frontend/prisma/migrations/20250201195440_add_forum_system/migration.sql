-- CreateEnum
CREATE TYPE "ForumPostStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'DISLIKE', 'LAUGH', 'THINKING', 'HEART');

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ForumPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "author_id" TEXT NOT NULL,
    "league_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ForumPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "author_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "quoted_post_id" TEXT,
    "quoted_comment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_reactions" (
    "id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT,
    "comment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_followers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forum_posts_author_id_idx" ON "forum_posts"("author_id");

-- CreateIndex
CREATE INDEX "forum_posts_league_id_idx" ON "forum_posts"("league_id");

-- CreateIndex
CREATE INDEX "forum_posts_status_idx" ON "forum_posts"("status");

-- CreateIndex
CREATE INDEX "forum_comments_author_id_idx" ON "forum_comments"("author_id");

-- CreateIndex
CREATE INDEX "forum_comments_post_id_idx" ON "forum_comments"("post_id");

-- CreateIndex
CREATE INDEX "forum_comments_quoted_comment_id_idx" ON "forum_comments"("quoted_comment_id");

-- CreateIndex
CREATE INDEX "forum_reactions_user_id_idx" ON "forum_reactions"("user_id");

-- CreateIndex
CREATE INDEX "forum_reactions_post_id_idx" ON "forum_reactions"("post_id");

-- CreateIndex
CREATE INDEX "forum_reactions_comment_id_idx" ON "forum_reactions"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "forum_reactions_user_id_post_id_comment_id_type_key" ON "forum_reactions"("user_id", "post_id", "comment_id", "type");

-- CreateIndex
CREATE INDEX "forum_followers_user_id_idx" ON "forum_followers"("user_id");

-- CreateIndex
CREATE INDEX "forum_followers_post_id_idx" ON "forum_followers"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "forum_followers_user_id_post_id_key" ON "forum_followers"("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_quoted_comment_id_fkey" FOREIGN KEY ("quoted_comment_id") REFERENCES "forum_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_reactions" ADD CONSTRAINT "forum_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "forum_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_followers" ADD CONSTRAINT "forum_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_followers" ADD CONSTRAINT "forum_followers_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "forum_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
