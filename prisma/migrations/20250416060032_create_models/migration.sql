/*
  Warnings:

  - A unique constraint covering the columns `[userId,accountId]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,isGlobal]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "budgets_userId_key";

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "accountId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_accountId_key" ON "budgets"("userId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_isGlobal_key" ON "budgets"("userId", "isGlobal");
