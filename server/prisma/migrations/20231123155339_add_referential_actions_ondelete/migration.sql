-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_entries_changes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entry_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "changes" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "entries_changes_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entries_changes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_entries_changes" ("changes", "created_at", "entry_id", "id", "updated_at", "user_id") SELECT "changes", "created_at", "entry_id", "id", "updated_at", "user_id" FROM "entries_changes";
DROP TABLE "entries_changes";
ALTER TABLE "new_entries_changes" RENAME TO "entries_changes";
CREATE TABLE "new_entries_media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entry_id" INTEGER NOT NULL,
    "media_id" INTEGER NOT NULL,
    "position" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "entries_media_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entries_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_entries_media" ("created_at", "entry_id", "id", "media_id", "position", "updated_at") SELECT "created_at", "entry_id", "id", "media_id", "position", "updated_at" FROM "entries_media";
DROP TABLE "entries_media";
ALTER TABLE "new_entries_media" RENAME TO "entries_media";
CREATE TABLE "new_translations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "name_normalized" TEXT,
    "languageId" INTEGER NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "translations_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "translations_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_translations" ("created_at", "entry_id", "id", "languageId", "name", "name_normalized", "updated_at") SELECT "created_at", "entry_id", "id", "languageId", "name", "name_normalized", "updated_at" FROM "translations";
DROP TABLE "translations";
ALTER TABLE "new_translations" RENAME TO "translations";
CREATE TABLE "new_variations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "name_normalized" TEXT,
    "entry_id" INTEGER NOT NULL,
    CONSTRAINT "variations_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_variations" ("entry_id", "id", "name", "name_normalized") SELECT "entry_id", "id", "name", "name_normalized" FROM "variations";
DROP TABLE "variations";
ALTER TABLE "new_variations" RENAME TO "variations";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
