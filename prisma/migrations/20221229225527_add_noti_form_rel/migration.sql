-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
