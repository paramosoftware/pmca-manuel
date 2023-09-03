-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_entries_changes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entry_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "changes" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "entries_changes_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "entries_changes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_entries_changes" ("changes", "created_at", "entry_id", "id", "updated_at", "user_id") SELECT "changes", "created_at", "entry_id", "id", "updated_at", "user_id" FROM "entries_changes";
DROP TABLE "entries_changes";
ALTER TABLE "new_entries_changes" RENAME TO "entries_changes";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
