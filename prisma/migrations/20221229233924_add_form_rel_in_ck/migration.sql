-- DropIndex
DROP INDEX "FormCommonKey_formId_key";

-- AddForeignKey
ALTER TABLE "FormCommonKey" ADD CONSTRAINT "FormCommonKey_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
