/*
  Warnings:

  - You are about to drop the column `userId` on the `Voucher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identityId]` on the table `Voucher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identityId` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Voucher_userId_key";

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "userId",
ADD COLUMN     "identityId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_identityId_key" ON "Voucher"("identityId");
