/*
  Warnings:

  - You are about to drop the column `averageRating` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfReviews` on the `Property` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyType" ADD VALUE 'House';
ALTER TYPE "PropertyType" ADD VALUE 'Condo';
ALTER TYPE "PropertyType" ADD VALUE 'Studio';
ALTER TYPE "PropertyType" ADD VALUE 'Loft';

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "averageRating",
DROP COLUMN "numberOfReviews",
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "propertyId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagerInviteCode" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagerInviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_propertyId_tenantId_key" ON "Review"("propertyId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerInviteCode_code_key" ON "ManagerInviteCode"("code");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
