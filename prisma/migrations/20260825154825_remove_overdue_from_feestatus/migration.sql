-- AlterEnum: Remove OVERDUE from FeeStatus enum
-- First, update any existing rows that might have OVERDUE (shouldn't exist, but safety first)
UPDATE "MembershipFee" SET "status" = 'PENDING' WHERE "status"::text = 'OVERDUE';

-- Create a new enum type without OVERDUE
ALTER TYPE "FeeStatus" ADD VALUE IF NOT EXISTS 'TEMP_PENDING' BEFORE 'PENDING';

-- We need to recreate the column since PostgreSQL doesn't support DROP VALUE from enum directly
-- Step 1: Add temp column with new enum type
ALTER TABLE "MembershipFee" ADD COLUMN "status_temp" text;

-- Step 2: Copy data
UPDATE "MembershipFee" SET "status_temp" = "status"::text;

-- Step 3: Drop old column
ALTER TABLE "MembershipFee" DROP COLUMN "status";

-- Step 4: Drop old enum
DROP TYPE "FeeStatus";

-- Step 5: Create new enum without OVERDUE
CREATE TYPE "FeeStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED');

-- Step 6: Add column back with correct type
ALTER TABLE "MembershipFee" ADD COLUMN "status" "FeeStatus" NOT NULL DEFAULT 'PENDING';

-- Step 7: Restore data
UPDATE "MembershipFee" SET "status" = "status_temp"::"FeeStatus";

-- Step 8: Drop temp column
ALTER TABLE "MembershipFee" DROP COLUMN "status_temp";
