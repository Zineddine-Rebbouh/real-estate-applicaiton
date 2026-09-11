-- CreateEnum
CREATE TYPE "MoveInTimeline" AS ENUM ('ASAP', 'Within30Days', 'Within90Days', 'JustBrowsing');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "desiredBaths" INTEGER,
ADD COLUMN     "desiredBeds" INTEGER,
ADD COLUMN     "hasPets" BOOLEAN,
ADD COLUMN     "householdSize" INTEGER,
ADD COLUMN     "maxBudget" DECIMAL(10,2),
ADD COLUMN     "minBudget" DECIMAL(10,2),
ADD COLUMN     "moveInTimeline" "MoveInTimeline",
ADD COLUMN     "needsParking" BOOLEAN,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "petType" TEXT,
ADD COLUMN     "preferredCity" TEXT;
