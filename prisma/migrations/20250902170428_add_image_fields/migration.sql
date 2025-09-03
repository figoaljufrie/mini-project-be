-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "thumbnailPublicId" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "paymentProofPublicId" TEXT,
ADD COLUMN     "paymentProofUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatarPublicId" TEXT,
ADD COLUMN     "avatarUrl" TEXT;
