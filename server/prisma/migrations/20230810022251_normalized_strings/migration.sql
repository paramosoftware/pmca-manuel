/*
  Warnings:

  - You are about to drop the column `code` on the `web_pages` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "languages" ADD COLUMN "name_normalized" TEXT;

-- AlterTable
ALTER TABLE "media" ADD COLUMN "subtitle_normalized" TEXT;

-- AlterTable
ALTER TABLE "references" ADD COLUMN "name_normalized" TEXT;

-- AlterTable
ALTER TABLE "translations" ADD COLUMN "name_normalized" TEXT;

-- AlterTable
ALTER TABLE "variations" ADD COLUMN "name_normalized" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_web_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "menu_name" TEXT NOT NULL,
    "slug" TEXT,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_web_pages" ("content", "created_at", "id", "menu_name", "name", "updated_at") SELECT "content", "created_at", "id", "menu_name", "name", "updated_at" FROM "web_pages";
DROP TABLE "web_pages";
ALTER TABLE "new_web_pages" RENAME TO "web_pages";
CREATE UNIQUE INDEX "web_pages_name_key" ON "web_pages"("name");
CREATE UNIQUE INDEX "web_pages_slug_key" ON "web_pages"("slug");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "name_normalized" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT '1',
    "refresh_token" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_users" ("created_at", "email", "id", "name", "password", "refresh_token", "role", "updated_at") SELECT "created_at", "email", "id", "name", "password", "refresh_token", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");
CREATE UNIQUE INDEX "users_refresh_token_key" ON "users"("refresh_token");
CREATE TABLE "new_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT,
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
INSERT INTO "new_entries" ("category_id", "created_at", "definition", "definition_normalized", "id", "name", "name_normalized", "notes", "notes_normalized", "updated_at") SELECT "category_id", "created_at", "definition", "definition_normalized", "id", "name", "name_normalized", "notes", "notes_normalized", "updated_at" FROM "entries";
DROP TABLE "entries";
ALTER TABLE "new_entries" RENAME TO "entries";
CREATE UNIQUE INDEX "entries_slug_key" ON "entries"("slug");
CREATE UNIQUE INDEX "entries_name_key" ON "entries"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
