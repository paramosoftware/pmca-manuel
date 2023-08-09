-- CreateTable
CREATE TABLE "web_pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "web_pages_name_key" ON "web_pages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "web_pages_code_key" ON "web_pages"("code");
