/*
  Warnings:

  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Driver";

-- CreateTable
CREATE TABLE "drivers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "id_card" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numCar" TEXT NOT NULL,
    "seat_count" INTEGER NOT NULL,
    "current_mileage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "brand" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_id_card_key" ON "drivers"("id_card");

-- CreateIndex
CREATE INDEX "drivers_is_active_idx" ON "drivers"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_numCar_key" ON "vehicles"("numCar");

-- CreateIndex
CREATE INDEX "vehicles_is_active_idx" ON "vehicles"("is_active");
