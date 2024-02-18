-- CreateTable
CREATE TABLE "Voucher" (
    "_id" TEXT NOT NULL,
    "voucher" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_voucher_key" ON "Voucher"("voucher");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_userId_key" ON "Voucher"("userId");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher__id_fkey" FOREIGN KEY ("_id") REFERENCES "Identity"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
