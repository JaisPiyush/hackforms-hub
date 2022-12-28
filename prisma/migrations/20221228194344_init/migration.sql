-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eoa" VARCHAR(80) NOT NULL,
    "pubKey" VARCHAR(50) NOT NULL,
    "secretKey" VARCHAR(110) NOT NULL,
    "isEOAWeb2" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" VARCHAR(300) NOT NULL,
    "cid" VARCHAR(64) NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "ownerEOA" VARCHAR(80) NOT NULL,
    "ownerpubKey" VARCHAR(50) NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formId" TEXT NOT NULL,
    "ownerEOA" VARCHAR(80) NOT NULL,
    "ownerpubKey" VARCHAR(50) NOT NULL,
    "cid" VARCHAR(64) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormStats" (
    "id" SERIAL NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numberOfResponse" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "formId" TEXT NOT NULL,

    CONSTRAINT "FormStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_eoa_key" ON "UserProfile"("eoa");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_pubKey_key" ON "UserProfile"("pubKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_secretKey_key" ON "UserProfile"("secretKey");

-- CreateIndex
CREATE INDEX "UserProfile_eoa_pubKey_idx" ON "UserProfile"("eoa", "pubKey");

-- CreateIndex
CREATE UNIQUE INDEX "Form_cid_key" ON "Form"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "Form_ownerEOA_key" ON "Form"("ownerEOA");

-- CreateIndex
CREATE UNIQUE INDEX "Form_ownerpubKey_key" ON "Form"("ownerpubKey");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_ownerEOA_key" ON "FormResponse"("ownerEOA");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_ownerpubKey_key" ON "FormResponse"("ownerpubKey");

-- CreateIndex
CREATE UNIQUE INDEX "FormResponse_cid_key" ON "FormResponse"("cid");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStats" ADD CONSTRAINT "FormStats_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
