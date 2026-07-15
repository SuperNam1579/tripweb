-- AlterTable
ALTER TABLE "Member" ADD COLUMN "color" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Member_tripId_color_key" ON "Member"("tripId", "color");
