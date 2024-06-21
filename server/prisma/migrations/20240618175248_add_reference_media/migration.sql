-- CreateTable
CREATE TABLE "ReferenceMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "originalFilename" TEXT,
    "path" TEXT,
    "subtitle" TEXT,
    "type" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "subtitleNormalized" TEXT,
    "referenceId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReferenceMedia_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Reference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceMedia_name_key" ON "ReferenceMedia"("name");
