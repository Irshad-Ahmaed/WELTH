/*
  Warnings:

  - Added the required column `accountId` to the `budgets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "accountId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "budgets_accountId_idx" ON "budgets"("accountId");

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
