-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Concept" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
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
    CONSTRAINT "Concept_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Concept" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Concept" ("accessCount", "createdAt", "definition", "definitionNormalized", "id", "name", "nameNormalized", "nameSlug", "notes", "notesNormalized", "parentId", "privateNotes", "privateNotesNormalized", "published", "updatedAt") SELECT "accessCount", "createdAt", "definition", "definitionNormalized", "id", "name", "nameNormalized", "nameSlug", "notes", "notesNormalized", "parentId", "privateNotes", "privateNotesNormalized", "published", "updatedAt" FROM "Concept";
DROP TABLE "Concept";
ALTER TABLE "new_Concept" RENAME TO "Concept";
CREATE UNIQUE INDEX "Concept_nameSlug_key" ON "Concept"("nameSlug");
PRAGMA foreign_key_check("Concept");
PRAGMA foreign_keys=ON;
