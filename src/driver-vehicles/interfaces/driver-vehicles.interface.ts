/* eslint-disable prettier/prettier */
import { Pagination } from 'src/common';
import { Driver, Vehicle } from 'src/generated/prisma/client';

export interface DriverVehicles {
  id: string | null;
  date: Date | null;
  driverId: string | null;
  driver?: Driver | null;
  vehicle?: Vehicle | null;
  vehicleId: string | null;
}

export interface AssignDriverVehicles {
  driverId: string;
  vehicleId: string;
}

export interface DriverStatusFilter extends Pagination {
  vehicleId?: string;
  date?: string;
  driverId?: string;
}

export interface DriverVehicleList {
  items: DriverVehicles[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
