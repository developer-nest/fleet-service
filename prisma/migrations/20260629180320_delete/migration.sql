/*
  Warnings:

  - You are about to drop the `driver_vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "driver_vehicles" DROP CONSTRAINT "driver_vehicles_driverId_fkey";

-- DropForeignKey
ALTER TABLE "driver_vehicles" DROP CONSTRAINT "driver_vehicles_vehicleId_fkey";

-- DropTable
DROP TABLE "driver_vehicles";
