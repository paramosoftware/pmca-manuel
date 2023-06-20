-- CreateTable
CREATE TABLE "variations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "entry_id" INTEGER NOT NULL,
    CONSTRAINT "variations_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
