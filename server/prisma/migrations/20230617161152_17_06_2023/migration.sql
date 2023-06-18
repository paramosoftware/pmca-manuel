-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" TEXT DEFAULT 'user',
    "refresh_token" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_User" ("created_at", "email", "first_name", "id", "last_name", "password", "refresh_token", "role", "updated_at") SELECT "created_at", "email", "first_name", "id", "last_name", "password", "refresh_token", "role", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_refresh_token_key" ON "User"("refresh_token");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
