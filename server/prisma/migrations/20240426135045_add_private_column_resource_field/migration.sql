-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResourceField" (
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
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "nameNormalized" TEXT,
    "labelNormalized" TEXT,
    "placeholderNormalized" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME,
    CONSTRAINT "ResourceField_oppositeFieldId_fkey" FOREIGN KEY ("oppositeFieldId") REFERENCES "ResourceField" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ResourceField_relatedResourceId_fkey" FOREIGN KEY ("relatedResourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResourceField_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ResourceField" ("allowCreate", "allowMultiple", "createdAt", "defaultOptions", "defaultValue", "disabled", "hidden", "id", "includeExport", "inputType", "isHierarchical", "isRich", "label", "labelNormalized", "max", "name", "nameNormalized", "oppositeFieldId", "placeholder", "placeholderNormalized", "position", "published", "query", "relatedResourceId", "required", "resourceId", "uiField", "updatedAt", "valueType") SELECT "allowCreate", "allowMultiple", "createdAt", "defaultOptions", "defaultValue", "disabled", "hidden", "id", "includeExport", "inputType", "isHierarchical", "isRich", "label", "labelNormalized", "max", "name", "nameNormalized", "oppositeFieldId", "placeholder", "placeholderNormalized", "position", "published", "query", "relatedResourceId", "required", "resourceId", "uiField", "updatedAt", "valueType" FROM "ResourceField";
DROP TABLE "ResourceField";
ALTER TABLE "new_ResourceField" RENAME TO "ResourceField";
CREATE UNIQUE INDEX "ResourceField_resourceId_name_key" ON "ResourceField"("resourceId", "name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
