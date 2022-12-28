-- CreateTable
CREATE TABLE "FormCommonKey" (
    "id" SERIAL NOT NULL,
    "formId" TEXT NOT NULL,
    "key" VARCHAR(300) NOT NULL,

    CONSTRAINT "FormCommonKey_pkey" PRIMARY KEY ("id")
);
