-- CreateTable
CREATE TABLE "Identity" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nonceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Identity_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Nonce" (
    "_id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "burned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Nonce_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Identity_name_key" ON "Identity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Identity_nonceId_key" ON "Identity"("nonceId");

-- CreateIndex
CREATE UNIQUE INDEX "Nonce_nonce_key" ON "Nonce"("nonce");

-- AddForeignKey
ALTER TABLE "Identity" ADD CONSTRAINT "Identity_nonceId_fkey" FOREIGN KEY ("nonceId") REFERENCES "Nonce"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
