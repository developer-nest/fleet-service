import { DriverStatusHistory } from 'src/generated/prisma/client';
import { DriverStatusHistoryResponse } from '../interfaces/driver-status-history.interface';
import { toIsoStringOrEmpty } from 'src/common';

export function toDriverStatusHistoryResponse(
  entity: DriverStatusHistory,
): DriverStatusHistoryResponse {
  return {
    id: entity.id,
    date: toIsoStringOrEmpty(entity.date),
    status: entity.status,
    returnDate: toIsoStringOrEmpty(entity.returnDate),
    driverId: entity.driverId,
  };
}
