/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `entries` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "entries" ADD COLUMN "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "entries_code_key" ON "entries"("code");
