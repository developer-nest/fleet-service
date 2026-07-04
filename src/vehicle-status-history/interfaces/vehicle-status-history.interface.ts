/* eslint-disable prettier/prettier */
import { Pagination } from 'src/common';
import {
  Vehicle,
  VehicleStatusHistory as PrismaVehicleStatusHistory,
} from 'src/generated/prisma/client';
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

export interface VehicleStatusHistoryResponse {
  id: string;
  date: string;
  vehicleId: string;
  status: CarStatus;
  returnDate?: string;
  vehicle?: Vehicle | null;
}

export interface VehicleStatusHistoryList {
  items: VehicleStatusHistoryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleStatusHistoryListPrisma {
  items: PrismaVehicleStatusHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
