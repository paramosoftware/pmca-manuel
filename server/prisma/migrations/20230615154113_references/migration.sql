/*
  Warnings:

  - You are about to drop the column `references` on the `entries` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "references" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_entries_references" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_entries_references_A_fkey" FOREIGN KEY ("A") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_entries_references_B_fkey" FOREIGN KEY ("B") REFERENCES "references" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "definition" TEXT,
    "notes" TEXT,
    "category_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "entries_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_entries" ("category_id", "code", "created_at", "definition", "id", "name", "notes", "updated_at") SELECT "category_id", "code", "created_at", "definition", "id", "name", "notes", "updated_at" FROM "entries";
DROP TABLE "entries";
ALTER TABLE "new_entries" RENAME TO "entries";
CREATE UNIQUE INDEX "entries_code_key" ON "entries"("code");
CREATE UNIQUE INDEX "entries_name_key" ON "entries"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_entries_references_AB_unique" ON "_entries_references"("A", "B");

-- CreateIndex
CREATE INDEX "_entries_references_B_index" ON "_entries_references"("B");
