/*
  Warnings:

  - You are about to drop the column `eventEventId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_eventEventId_fkey";

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "eventEventId";

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;
