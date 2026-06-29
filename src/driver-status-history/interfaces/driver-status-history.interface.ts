/* eslint-disable prettier/prettier */
import { Pagination } from 'src/common';
import { Driver } from 'src/generated/prisma/client';
import { DriverSituation } from 'src/generated/prisma/enums';

export interface DriverStatusHistory {
  id: string | null;
  date: Date | null;
  driverId: string | null;
  status: DriverSituation | null;
  returnDate?: Date | null;
  driver?: Driver | null;
}

export interface CreateDriverStatus {
  status: DriverSituation;
  driverId: string;
  returnDate?: string;
}

export interface DriverStatusFilter extends Pagination {
  status?: DriverSituation;
  date?: string;
  driverId?: string;
}

export interface DriverStatusHistoryList {
  items: DriverStatusHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
