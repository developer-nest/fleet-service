/* eslint-disable prettier/prettier */
import { DriverSituation } from 'src/generated/prisma/enums';

export interface DriverById {
  id: string;
}

export interface Driver {
  id: string | null;
  fullName: string | null;
  address: string | null;
  idCard: string | null;
  isActive: boolean | null;
  category: string | null;
  fixedVehicleId?: string | null;
  currentSituation: DriverSituation | null;
}

export interface DriverList {
  items: Driver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDriver {
  fullName: string;
  address: string;
  idCard: string;
  isActive: boolean;
  category: string;
  fixedVehicleId?: string;
  currentSituation?: DriverSituation;
}

export interface UpdateDriver extends Partial<CreateDriver> {
  id: string;
}

export interface Pagination {
  limit: number;
  page: number;
}

export interface StatusDriverPagination extends Pagination {
  status?: DriverSituation;
  isActive?: boolean;
}
