-- Guest reviews: no account needed, with fun extras (quick tags, kid age, verified buyer).
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";
ALTER TABLE "Review" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Review" ADD COLUMN "guestName" TEXT;
ALTER TABLE "Review" ADD COLUMN "guestCity" TEXT;
ALTER TABLE "Review" ADD COLUMN "kidAge" TEXT;
ALTER TABLE "Review" ADD COLUMN "tags" TEXT[];
ALTER TABLE "Review" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
