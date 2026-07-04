/* eslint-disable prettier/prettier */
import { Pagination } from 'src/common';
import { Driver } from 'src/generated/prisma/client';
import { DriverSituation } from 'src/generated/prisma/enums';
import { DriverStatusHistory as PrismaDriverStatusHistory } from 'src/generated/prisma/client';

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
  items: DriverStatusHistoryResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DriverStatusHistoryResponse {
  id: string;
  date: string; // 👈 string, como pide el proto
  driverId: string;
  status: DriverSituation;
  returnDate?: string; // 👈 string
  driver?: Driver | null;
}

export interface DriverStatusHistoryListPrisma {
  items: PrismaDriverStatusHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
