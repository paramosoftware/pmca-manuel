/*
  Warnings:

  - Made the column `glossaryId` on table `Concept` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

INSERT INTO "Glossary" ("name", "code", "createdAt", "updatedAt") SELECT 'Padrão migração', 'default-migrate', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP WHERE EXISTS (SELECT 1 FROM "Concept" WHERE "glossaryId" IS NULL);
UPDATE "Concept" SET "glossaryId" = (SELECT "id" FROM "Glossary" WHERE "nameSlug" = 'default-migrate') WHERE "glossaryId" IS NULL;

CREATE TABLE "new_Concept" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "glossaryId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "nameSlug" TEXT NOT NULL,
    "definition" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 1,
    "definitionNormalized" TEXT,
    "nameNormalized" TEXT,
    "notesNormalized" TEXT,
    "privateNotesNormalized" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Concept_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "Glossary" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Concept_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Concept" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Concept" ("accessCount", "createdAt", "definition", "definitionNormalized", "glossaryId", "id", "name", "nameNormalized", "nameSlug", "notes", "notesNormalized", "parentId", "position", "privateNotes", "privateNotesNormalized", "published", "updatedAt") SELECT "accessCount", "createdAt", "definition", "definitionNormalized", "glossaryId", "id", "name", "nameNormalized", "nameSlug", "notes", "notesNormalized", "parentId", "position", "privateNotes", "privateNotesNormalized", "published", "updatedAt" FROM "Concept";
DROP TABLE "Concept";
ALTER TABLE "new_Concept" RENAME TO "Concept";
CREATE UNIQUE INDEX "Concept_nameSlug_key" ON "Concept"("nameSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
