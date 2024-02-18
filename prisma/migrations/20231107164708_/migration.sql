/*
  Warnings:

  - You are about to drop the column `identityId` on the `Voucher` table. All the data in the column will be lost.
  - You are about to drop the column `voucher` on the `Voucher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cleanEmail]` on the table `Voucher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pubkey]` on the table `Voucher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cleanEmail` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pubkey` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationCode` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher__id_fkey";

-- DropIndex
DROP INDEX "Voucher_identityId_key";

-- DropIndex
DROP INDEX "Voucher_voucher_key";

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "identityId",
DROP COLUMN "voucher",
ADD COLUMN     "claimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cleanEmail" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "pubkey" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationCode" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_cleanEmail_key" ON "Voucher"("cleanEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_pubkey_key" ON "Voucher"("pubkey");

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_pubkey_fkey" FOREIGN KEY ("pubkey") REFERENCES "Identity"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
