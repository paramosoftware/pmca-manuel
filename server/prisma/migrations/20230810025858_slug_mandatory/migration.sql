/*
  Warnings:

  - Made the column `slug` on table `web_pages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `entries` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_web_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "menu_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_web_pages" ("content", "created_at", "id", "menu_name", "name", "slug", "updated_at") SELECT "content", "created_at", "id", "menu_name", "name", "slug", "updated_at" FROM "web_pages";
DROP TABLE "web_pages";
ALTER TABLE "new_web_pages" RENAME TO "web_pages";
CREATE UNIQUE INDEX "web_pages_name_key" ON "web_pages"("name");
CREATE UNIQUE INDEX "web_pages_slug_key" ON "web_pages"("slug");
CREATE TABLE "new_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_normalized" TEXT,
    "definition" TEXT,
    "definition_normalized" TEXT,
    "notes" TEXT,
    "notes_normalized" TEXT,
    "category_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_entries" ("category_id", "created_at", "definition", "definition_normalized", "id", "name", "name_normalized", "notes", "notes_normalized", "slug", "updated_at") SELECT "category_id", "created_at", "definition", "definition_normalized", "id", "name", "name_normalized", "notes", "notes_normalized", "slug", "updated_at" FROM "entries";
DROP TABLE "entries";
ALTER TABLE "new_entries" RENAME TO "entries";
CREATE UNIQUE INDEX "entries_slug_key" ON "entries"("slug");
CREATE UNIQUE INDEX "entries_name_key" ON "entries"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
