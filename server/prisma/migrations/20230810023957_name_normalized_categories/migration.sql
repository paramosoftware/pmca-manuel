/*
  Warnings:

  - A unique constraint covering the columns `[nameNormalized]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN "nameNormalized" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "categories_nameNormalized_key" ON "categories"("nameNormalized");
