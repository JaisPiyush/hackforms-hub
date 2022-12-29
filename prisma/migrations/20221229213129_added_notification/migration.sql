-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "formId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasSeen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_formId_userId_idx" ON "Notification"("formId", "userId");
