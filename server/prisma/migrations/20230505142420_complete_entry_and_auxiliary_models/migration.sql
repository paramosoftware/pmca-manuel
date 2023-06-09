/*
  Warnings:

  - You are about to drop the column `content` on the `entries` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `entries` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `entries` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `entries` table. All the data in the column will be lost.
  - Added the required column `name` to the `entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `entries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "languages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "code" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "subtitle" TEXT,
    "private" BOOLEAN DEFAULT false,
    "position" INTEGER,
    "type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "translations_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_media_entries" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_media_entries_A_fkey" FOREIGN KEY ("A") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_media_entries_B_fkey" FOREIGN KEY ("B") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_entries_entries" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_entries_entries_A_fkey" FOREIGN KEY ("A") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_entries_entries_B_fkey" FOREIGN KEY ("B") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "definition" TEXT,
    "notes" TEXT,
    "references" TEXT,
    "category_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_entries" ("id") SELECT "id" FROM "entries";
DROP TABLE "entries";
ALTER TABLE "new_entries" RENAME TO "entries";
CREATE UNIQUE INDEX "entries_name_key" ON "entries"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "languages_abbreviation_key" ON "languages"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_media_entries_AB_unique" ON "_media_entries"("A", "B");

-- CreateIndex
CREATE INDEX "_media_entries_B_index" ON "_media_entries"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_entries_entries_AB_unique" ON "_entries_entries"("A", "B");

-- CreateIndex
CREATE INDEX "_entries_entries_B_index" ON "_entries_entries"("B");
