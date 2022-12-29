/*
  Warnings:

  - A unique constraint covering the columns `[formId]` on the table `FormCommonKey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `FormCommonKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Access" AS ENUM ('public', 'private', 'protected');

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "access" "Access" NOT NULL DEFAULT 'private',
ALTER COLUMN "ownerpubKey" SET DATA TYPE VARCHAR(130);

-- AlterTable
ALTER TABLE "FormResponse" ADD COLUMN     "access" "Access" NOT NULL DEFAULT 'private',
ALTER COLUMN "ownerpubKey" SET DATA TYPE VARCHAR(130);

-- AlterTable
ALTER TABLE "FormStats" ALTER COLUMN "numberOfResponse" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "pubKey" SET DATA TYPE VARCHAR(130);

-- CreateIndex
CREATE UNIQUE INDEX "FormCommonKey_formId_key" ON "FormCommonKey"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "FormCommonKey_key_key" ON "FormCommonKey"("key");
