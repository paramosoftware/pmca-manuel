-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nameSlug" TEXT NOT NULL,
    "nameNormalized" TEXT,
    "descriptionNormalized" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "GroupPermission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "resourceId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "read" BOOLEAN DEFAULT true,
    "create" BOOLEAN DEFAULT false,
    "update" BOOLEAN DEFAULT false,
    "delete" BOOLEAN DEFAULT false,
    "batch" BOOLEAN DEFAULT false,
    "import" BOOLEAN DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroupPermission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupPermission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "labelPlural" TEXT NOT NULL,
    "description" TEXT,
    "genderNoun" TEXT NOT NULL DEFAULT 'n',
    "isRelation" BOOLEAN DEFAULT false,
    "isHierarchical" BOOLEAN DEFAULT false,
    "isAppModel" BOOLEAN DEFAULT false,
    "isPublic" BOOLEAN DEFAULT false,
    "parentId" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "modelNormalized" TEXT NOT NULL,
    "nameSlug" TEXT NOT NULL,
    "labelSlug" TEXT NOT NULL,
    "nameNormalized" TEXT,
    "labelNormalized" TEXT,
    "labelPluralNormalized" TEXT,
    "descriptionNormalized" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "Resource_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Resource" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResourceField" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'string',
    "uiField" TEXT NOT NULL DEFAULT 'input',
    "required" BOOLEAN DEFAULT false,
    "hidden" BOOLEAN DEFAULT false,
    "disabled" BOOLEAN DEFAULT false,
    "inputType" TEXT DEFAULT 'text',
    "placeholder" TEXT,
    "defaultValue" TEXT,
    "defaultOptions" TEXT,
    "query" TEXT,
    "max" INTEGER,
    "isRich" BOOLEAN DEFAULT false,
    "isHierarchical" BOOLEAN DEFAULT false,
    "allowCreate" BOOLEAN DEFAULT true,
    "allowMultiple" BOOLEAN DEFAULT true,
    "includeExport" BOOLEAN DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "oppositeFieldId" INTEGER,
    "relatedResourceId" INTEGER,
    "resourceId" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "nameNormalized" TEXT,
    "labelNormalized" TEXT,
    "placeholderNormalized" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "ResourceField_oppositeFieldId_fkey" FOREIGN KEY ("oppositeFieldId") REFERENCES "ResourceField" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ResourceField_relatedResourceId_fkey" FOREIGN KEY ("relatedResourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResourceField_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isBlocked" BOOLEAN DEFAULT false,
    "isAdmin" BOOLEAN DEFAULT false,
    "authorId" INTEGER,
    "groupId" INTEGER,
    "nameNormalized" TEXT,
    "loginNormalized" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "User_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Author" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameSlug" TEXT NOT NULL,
    "definition" TEXT,
    "notes" TEXT,
    "parentId" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "definitionNormalized" TEXT,
    "nameNormalized" TEXT,
    "notesNormalized" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Entry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Entry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryChanges" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "changes" TEXT NOT NULL,
    "authorId" INTEGER,
    "entryId" INTEGER NOT NULL,
    "fieldId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntryChanges_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EntryChanges_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryChanges_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ResourceField" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "originalFilename" TEXT,
    "path" TEXT,
    "subtitle" TEXT,
    "type" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "subtitleNormalized" TEXT,
    "entryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntryMedia_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryVariation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT,
    "entryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntryVariation_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "languageId" INTEGER,
    "entryId" INTEGER NOT NULL,
    "nameNormalized" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntryTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryTranslation_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Language" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "nameNormalized" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameRich" TEXT,
    "nameNormalized" TEXT,
    "published" BOOLEAN DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WebPage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameSlug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "menuName" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "nameNormalized" TEXT,
    "contentNormalized" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_EntryToEntry" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EntryToEntry_A_fkey" FOREIGN KEY ("A") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EntryToEntry_B_fkey" FOREIGN KEY ("B") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EntryToReference" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EntryToReference_A_fkey" FOREIGN KEY ("A") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EntryToReference_B_fkey" FOREIGN KEY ("B") REFERENCES "Reference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_nameSlug_key" ON "Group"("nameSlug");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPermission_resourceId_groupId_key" ON "GroupPermission"("resourceId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_name_key" ON "Resource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_nameSlug_key" ON "Resource"("nameSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_labelSlug_key" ON "Resource"("labelSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceField_resourceId_name_key" ON "ResourceField"("resourceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON "UserSession"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_refreshToken_key" ON "UserSession"("userId", "refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_nameSlug_key" ON "Entry"("nameSlug");

-- CreateIndex
CREATE UNIQUE INDEX "EntryMedia_name_key" ON "EntryMedia"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_name_key" ON "Reference"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WebPage_name_key" ON "WebPage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WebPage_nameSlug_key" ON "WebPage"("nameSlug");

-- CreateIndex
CREATE UNIQUE INDEX "_EntryToEntry_AB_unique" ON "_EntryToEntry"("A", "B");

-- CreateIndex
CREATE INDEX "_EntryToEntry_B_index" ON "_EntryToEntry"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_EntryToReference_AB_unique" ON "_EntryToReference"("A", "B");

-- CreateIndex
CREATE INDEX "_EntryToReference_B_index" ON "_EntryToReference"("B");
