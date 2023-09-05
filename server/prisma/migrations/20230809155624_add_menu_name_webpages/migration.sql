/*
  Warnings:

  - Added the required column `menu_name` to the `web_pages` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_web_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "menu_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_web_pages" ("code", "content", "created_at", "id", "name", "updated_at") SELECT "code", "content", "created_at", "id", "name", "updated_at" FROM "web_pages";
DROP TABLE "web_pages";
ALTER TABLE "new_web_pages" RENAME TO "web_pages";
CREATE UNIQUE INDEX "web_pages_name_key" ON "web_pages"("name");
CREATE UNIQUE INDEX "web_pages_code_key" ON "web_pages"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
