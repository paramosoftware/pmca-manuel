-- AlterTable
ALTER TABLE "Resource" ADD COLUMN "canBeExported" BOOLEAN DEFAULT false;
ALTER TABLE "Resource" ADD COLUMN "canBeImported" BOOLEAN DEFAULT false;
