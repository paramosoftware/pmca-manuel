-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Glossary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "languageId" INTEGER,
    "nameNormalized" TEXT,
    "descriptionNormalized" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Glossary_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Glossary" ("code", "createdAt", "description", "descriptionNormalized", "id", "languageId", "name", "nameNormalized", "published", "updatedAt") SELECT "code", "createdAt", "description", "descriptionNormalized", "id", "languageId", "name", "nameNormalized", "published", "updatedAt" FROM "Glossary";
DROP TABLE "Glossary";
ALTER TABLE "new_Glossary" RENAME TO "Glossary";
CREATE UNIQUE INDEX "Glossary_name_key" ON "Glossary"("name");
CREATE UNIQUE INDEX "Glossary_code_key" ON "Glossary"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
