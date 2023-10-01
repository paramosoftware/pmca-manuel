/*
  Warnings:

  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "name_normalized" TEXT,
    "password" TEXT NOT NULL,
    "role" INTEGER DEFAULT 1,
    "refresh_token" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);
INSERT INTO "new_users" ("created_at", "email", "id", "name", "name_normalized", "password", "refresh_token", "role", "updated_at") SELECT "created_at", "email", "id", "name", "name_normalized", "password", "refresh_token", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");
CREATE UNIQUE INDEX "users_refresh_token_key" ON "users"("refresh_token");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
