/* eslint-disable prettier/prettier */
//import { StatusDriver } from '../enum/status.enum';

import { CarStatus } from 'src/generated/prisma/enums';

//import { StatusVehicle } from 'src/generated/prisma/enums';

export interface VehicleById {
  id: string;
}

export interface Vehicle {
  id: string | null;
  numCar: string | null;
  seatCount: number;
  currentMileage: number | null;
  brand: string | null;
  isActive: boolean | null;
  currentSituation: CarStatus | null;
  //status: StatusVehicle;
}

export interface VehicleList {
  items: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVehicle {
  numCar: string;
  seatCount: number;
  currentMileage: number;
  brand: string;
  isActive: boolean;
  currentSituation?: CarStatus;
  //status: StatusVehicle;
}

export interface UpdateVehicle extends Partial<CreateVehicle> {
  id: string;
}

export interface Pagination {
  limit: number;
  page: number;
}

export interface StatusVehiclePagination extends Pagination {
  //status: StatusVehicle;
  status?: CarStatus;
  isActive?: boolean;
}
