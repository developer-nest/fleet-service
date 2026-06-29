/*
  Warnings:

  - You are about to drop the column `numCar` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the `status_history` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[num_car]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `num_car` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "status_history" DROP CONSTRAINT "status_history_vehicleId_fkey";

-- DropIndex
DROP INDEX "vehicles_numCar_key";

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "numCar",
ADD COLUMN     "num_car" TEXT NOT NULL;

-- DropTable
DROP TABLE "status_history";

-- CreateTable
CREATE TABLE "vehicle_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CarStatus" NOT NULL,
    "return_date" DATE,
    "vehicleId" UUID NOT NULL,

    CONSTRAINT "vehicle_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_num_car_key" ON "vehicles"("num_car");

-- AddForeignKey
ALTER TABLE "vehicle_status_history" ADD CONSTRAINT "vehicle_status_history_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
