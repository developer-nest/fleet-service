/* eslint-disable prettier/prettier */
import { Pagination } from 'src/common';
import { Vehicle } from 'src/generated/prisma/client';
import { CarStatus } from 'src/generated/prisma/enums';

export interface VehicleStatusHistory {
  id: string | null;
  date: Date | null;
  vehicleId: string | null;
  status: CarStatus | null;
  returnDate?: Date | null;
  vehicle?: Vehicle | null;
}

export interface CreateVehicleStatus {
  status: CarStatus;
  vehicleId: string;
  returnDate?: string;
}

export interface VehicleStatusFilter extends Pagination {
  status?: CarStatus;
  date?: string;
  vehicleId?: string;
}

export interface VehicleStatusHistoryList {
  items: VehicleStatusHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
