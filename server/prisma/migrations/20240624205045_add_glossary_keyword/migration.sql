-- CreateTable
CREATE TABLE "Glossary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "languageId" INTEGER,
    "nameNormalized" TEXT,
    "descriptionNormalized" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Glossary_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_GlossaryToKeyword" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_GlossaryToKeyword_A_fkey" FOREIGN KEY ("A") REFERENCES "Glossary" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GlossaryToKeyword_B_fkey" FOREIGN KEY ("B") REFERENCES "Keyword" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Concept" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "glossaryId" INTEGER,
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
    CONSTRAINT "Concept_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "Glossary" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Concept_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Concept" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Concept" ("accessCount", "createdAt", "definition", "definitionNormalized", "id", "name", "nameNormalized", "nameSlug", "notes", "notesNormalized", "parentId", "position", "privateNotes", "privateNotesNormalized", "published", "updatedAt") SELECT "accessCount", "createdAt", "definition", "definitionNormalized", "id", "name", "nameNormalized", "nameSlug", "notes", "notesNormalized", "parentId", "position", "privateNotes", "privateNotesNormalized", "published", "updatedAt" FROM "Concept";
DROP TABLE "Concept";
ALTER TABLE "new_Concept" RENAME TO "Concept";
CREATE UNIQUE INDEX "Concept_nameSlug_key" ON "Concept"("nameSlug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Glossary_name_key" ON "Glossary"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Glossary_code_key" ON "Glossary"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_name_key" ON "Keyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_GlossaryToKeyword_AB_unique" ON "_GlossaryToKeyword"("A", "B");

-- CreateIndex
CREATE INDEX "_GlossaryToKeyword_B_index" ON "_GlossaryToKeyword"("B");
