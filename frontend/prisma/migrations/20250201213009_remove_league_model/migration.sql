/*
  Warnings:

  - You are about to drop the column `published` on the `forum_posts` table. All the data in the column will be lost.
  - You are about to drop the `leagues` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "forum_posts" DROP CONSTRAINT "forum_posts_league_id_fkey";

-- AlterTable
ALTER TABLE "forum_posts" DROP COLUMN "published";

-- DropTable
DROP TABLE "leagues";
