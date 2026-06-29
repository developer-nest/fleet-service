/*
  Warnings:

  - A unique constraint covering the columns `[fixedVehicleId]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `drivers` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('AVAILABLE', 'WORKSHOP', 'INTERIOR', 'CITY');

-- CreateEnum
CREATE TYPE "DriverSituation" AS ENUM ('AVAILABLE', 'WORKSHOP', 'VACATION', 'DAY_OFF', 'CITY', 'INTERIOR', 'OTHER');

-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "fixedVehicleId" UUID;

-- CreateTable
CREATE TABLE "driver_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DriverSituation" NOT NULL,
    "returnDate" DATE,
    "driverId" UUID NOT NULL,

    CONSTRAINT "driver_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CarStatus" NOT NULL,
    "return_date" DATE,
    "vehicleId" UUID NOT NULL,

    CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" UUID NOT NULL,
    "driverId" UUID NOT NULL,

    CONSTRAINT "driver_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "driver_status_history_driverId_idx" ON "driver_status_history"("driverId");

-- CreateIndex
CREATE INDEX "driver_status_history_status_idx" ON "driver_status_history"("status");

-- CreateIndex
CREATE INDEX "driver_vehicles_vehicleId_idx" ON "driver_vehicles"("vehicleId");

-- CreateIndex
CREATE INDEX "driver_vehicles_driverId_idx" ON "driver_vehicles"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_fixedVehicleId_key" ON "drivers"("fixedVehicleId");

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_fixedVehicleId_fkey" FOREIGN KEY ("fixedVehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_status_history" ADD CONSTRAINT "driver_status_history_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_vehicles" ADD CONSTRAINT "driver_vehicles_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_vehicles" ADD CONSTRAINT "driver_vehicles_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
