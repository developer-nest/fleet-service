import { VehicleStatusHistory } from 'src/generated/prisma/client';
import { VehicleStatusHistoryResponse } from '../interfaces/vehicle-status-history.interface';
import { toIsoStringOrEmpty } from 'src/common';

export function toVehicleStatusHistoryResponse(
  entity: VehicleStatusHistory,
): VehicleStatusHistoryResponse {
  return {
    id: entity.id,
    date: toIsoStringOrEmpty(entity.date),
    status: entity.status,
    returnDate: toIsoStringOrEmpty(entity.returnDate),
    vehicleId: entity.vehicleId,
  };
}
