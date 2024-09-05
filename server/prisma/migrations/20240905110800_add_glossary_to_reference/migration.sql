-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

INSERT INTO "Glossary" ("name", "code", "createdAt", "updatedAt") SELECT 'Padrão migração', 'default-migrate', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP 
WHERE EXISTS (SELECT 1 FROM "Concept" WHERE "glossaryId" IS NULL)
AND EXISTS (select 1 from "Reference" where "glossaryId" IS NULL);

CREATE TABLE "new_Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "glossaryId" INTEGER,
    "nameRich" TEXT,
    "nameNormalized" TEXT,
    "published" BOOLEAN DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reference_glossaryId_fkey" FOREIGN KEY ("glossaryId") REFERENCES "Glossary" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Reference" ("createdAt", "id", "name", "nameNormalized", "nameRich", "published", "updatedAt") SELECT "createdAt", "id", "name", "nameNormalized", "nameRich", "published", "updatedAt" FROM "Reference";
DROP TABLE "Reference";
ALTER TABLE "new_Reference" RENAME TO "Reference";
CREATE UNIQUE INDEX "Reference_name_key" ON "Reference"("name");

UPDATE "Reference" SET "glossaryId" = (SELECT max("id") FROM "Glossary") WHERE "glossaryId" IS NULL;

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
