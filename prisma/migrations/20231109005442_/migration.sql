/*
  Warnings:

  - You are about to drop the column `pubkey` on the `Voucher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[voucherId]` on the table `Identity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher_pubkey_fkey";

-- DropIndex
DROP INDEX "Voucher_pubkey_key";

-- AlterTable
ALTER TABLE "Identity" ADD COLUMN     "voucherId" TEXT;

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "pubkey";

-- CreateIndex
CREATE UNIQUE INDEX "Identity_voucherId_key" ON "Identity"("voucherId");

-- AddForeignKey
ALTER TABLE "Identity" ADD CONSTRAINT "Identity_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
