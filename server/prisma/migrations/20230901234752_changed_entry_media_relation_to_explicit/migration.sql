/*
  Warnings:

  - You are about to drop the `_media_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `position` on the `media` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_media_entries_B_index";

-- DropIndex
DROP INDEX "_media_entries_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_media_entries";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "entries_media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entry_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "position" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "entries_media_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "entries_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "subtitle" TEXT,
    "subtitle_normalized" TEXT,
    "private" BOOLEAN DEFAULT false,
    "type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_media" ("created_at", "id", "name", "path", "private", "subtitle", "subtitle_normalized", "type", "updated_at") SELECT "created_at", "id", "name", "path", "private", "subtitle", "subtitle_normalized", "type", "updated_at" FROM "media";
DROP TABLE "media";
ALTER TABLE "new_media" RENAME TO "media";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
