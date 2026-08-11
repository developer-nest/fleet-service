/* eslint-disable prettier/prettier */
import { Pagination } from 'src/common';
import { Driver } from 'src/generated/prisma/client';
import { DriverSituation } from 'src/generated/prisma/enums';
import { DriverStatusHistory as PrismaDriverStatusHistory } from 'src/generated/prisma/client';

export interface DriverStatusHistory {
  id: string;
  date: Date;
  driverId: string;
  status: DriverSituation;
  returnDate?: Date;
  driver?: Driver;
}

export interface CreateDriverStatus {
  status: DriverSituation;
  driverId: string;
  returnDate?: string;
}

export interface DriverStatusFilter extends Pagination {
  status?: DriverSituation;
  date?: string; // fecha exacta (para "dime la situación de este día")
  dateFrom?: string; // 👈 nuevo: inicio del rango (para "dame el historial")
  dateTo?: string; // 👈 nuevo: fin del rango
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
  driver?: Driver;
}

export interface DriverStatusHistoryListPrisma {
  items: PrismaDriverStatusHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
