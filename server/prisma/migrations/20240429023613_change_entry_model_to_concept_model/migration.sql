/*
  Warnings:

  - You are about to drop the `Entry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntryChanges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntryMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntryTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EntryVariation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EntryToEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EntryToReference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Entry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EntryChanges";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EntryMedia";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EntryTranslation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EntryVariation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EntryToEntry";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EntryToReference";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Concept" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "nameSlug" TEXT NOT NULL,
    "definition" TEXT,
    "notes" TEXT,
    "privateNotes" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "definitionNormalized" TEXT,
    "nameNormalized" TEXT,
    "notesNormalized" TEXT,
    "privateNotesNormalized" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Concept_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Concept" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConceptChanges" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "changes" TEXT NOT NULL,
    "userId" TEXT,
    "conceptId" INTEGER NOT NULL,
    "fieldId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConceptChanges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ConceptChanges_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConceptChanges_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ResourceField" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConceptMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "originalFilename" TEXT,
    "path" TEXT,
    "subtitle" TEXT,
    "type" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "subtitleNormalized" TEXT,
    "conceptId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConceptMedia_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConceptVariation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT,
    "conceptId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConceptVariation_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConceptTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "languageId" INTEGER,
    "conceptId" INTEGER NOT NULL,
    "nameNormalized" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConceptTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConceptTranslation_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ConceptToConcept" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ConceptToConcept_A_fkey" FOREIGN KEY ("A") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConceptToConcept_B_fkey" FOREIGN KEY ("B") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ConceptToReference" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ConceptToReference_A_fkey" FOREIGN KEY ("A") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ConceptToReference_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Concept_nameSlug_key" ON "Concept"("nameSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptMedia_name_key" ON "ConceptMedia"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ConceptToConcept_AB_unique" ON "_ConceptToConcept"("A", "B");

-- CreateIndex
CREATE INDEX "_ConceptToConcept_B_index" ON "_ConceptToConcept"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ConceptToReference_AB_unique" ON "_ConceptToReference"("A", "B");

-- CreateIndex
CREATE INDEX "_ConceptToReference_B_index" ON "_ConceptToReference"("B");
