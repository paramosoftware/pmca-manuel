/*
  Warnings:

  - You are about to drop the `Author` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `authorId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `EntryChanges` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Author_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Author";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isBlocked" BOOLEAN DEFAULT false,
    "isAdmin" BOOLEAN DEFAULT false,
    "groupId" INTEGER,
    "nameNormalized" TEXT,
    "loginNormalized" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "groupId", "id", "isAdmin", "isBlocked", "login", "loginNormalized", "name", "nameNormalized", "password", "updatedAt") SELECT "createdAt", "email", "groupId", "id", "isAdmin", "isBlocked", "login", "loginNormalized", "name", "nameNormalized", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_EntryChanges" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "changes" TEXT NOT NULL,
    "userId" TEXT,
    "entryId" INTEGER NOT NULL,
    "fieldId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntryChanges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EntryChanges_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryChanges_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ResourceField" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EntryChanges" ("changes", "createdAt", "entryId", "fieldId", "id", "updatedAt") SELECT "changes", "createdAt", "entryId", "fieldId", "id", "updatedAt" FROM "EntryChanges";
DROP TABLE "EntryChanges";
ALTER TABLE "new_EntryChanges" RENAME TO "EntryChanges";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
