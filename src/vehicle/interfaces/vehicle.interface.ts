/* eslint-disable prettier/prettier */
//import { StatusDriver } from '../enum/status.enum';

import { CarStatus } from 'src/generated/prisma/enums';

//import { StatusVehicle } from 'src/generated/prisma/enums';

export interface Vehicle {
  id: string;
  numCar: string;
  seatCount: number;
  currentMileage: number;
  brand: string;
  isActive: boolean;
  currentSituation: CarStatus;
  //status: StatusVehicle;
}

export interface AvailabilityFilter {
  date: string;
}

export interface VehicleAvailabilityList {
  items: Vehicle[];
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

export interface UpdateVehicle {
  id: string;
  numCar?: string;
  seatCount?: number;
  currentMileage?: number;
  brand?: string;
  isActive?: boolean;
  currentSituation?: CarStatus;
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
