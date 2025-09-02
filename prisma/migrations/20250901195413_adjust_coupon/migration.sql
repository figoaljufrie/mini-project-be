/*
  Warnings:

  - You are about to drop the column `use` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Coupon" DROP COLUMN "use",
ADD COLUMN     "used" INTEGER DEFAULT 0;
