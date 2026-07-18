-- Region voting was removed: the owner now sets Trip.destination directly, so
-- ACTIVITY is the only category the app records. Drop the dead rows first, then
-- the enum value (Postgres has no DROP VALUE, so the type is recreated).

-- Delete rows that can no longer be produced or read by the app.
DELETE FROM "Vote" WHERE "category" = 'REGION';

-- AlterEnum
ALTER TYPE "VoteCategory" RENAME TO "VoteCategory_old";
CREATE TYPE "VoteCategory" AS ENUM ('ACTIVITY');
ALTER TABLE "Vote" ALTER COLUMN "category" TYPE "VoteCategory" USING ("category"::text::"VoteCategory");
DROP TYPE "VoteCategory_old";
