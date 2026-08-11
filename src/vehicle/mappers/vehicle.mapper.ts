import { Vehicle } from 'src/generated/prisma/client';

export function toVehicleResponse(entity: Vehicle): Vehicle {
  return {
    id: entity.id,
    numCar: entity.numCar,
    seatCount: entity.seatCount,
    currentMileage: entity.currentMileage,
    isActive: entity.isActive,
    brand: entity.brand,
    currentSituation: entity.currentSituation,
  };
}
