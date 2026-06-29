/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

import { GrpcMethod } from '@nestjs/microservices';

import {
  CreateVehicle,
  StatusVehiclePagination,
  UpdateVehicle,
  VehicleById,
  VehicleList,
} from './interfaces/vehicle.interface';
import { Vehicle } from 'src/generated/prisma/client';

@Controller('')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @GrpcMethod('VehicleService')
  create(data: CreateVehicle): Promise<Vehicle> {
    return this.vehicleService.create(data);
  }

  @GrpcMethod('VehicleService')
  async findAll(
    statusVehiclePagination: StatusVehiclePagination,
  ): Promise<VehicleList> {
    return this.vehicleService.findAll(statusVehiclePagination);
  }

  //@Get(':id')
  @GrpcMethod('VehicleService')
  async findOne(data: VehicleById): Promise<Vehicle | null> {
    return this.vehicleService.findOne({ id: data.id });
  }

  //@Patch(':id')
  @GrpcMethod('VehicleService')
  async update(updateVehicle: UpdateVehicle): Promise<Vehicle> {
    const { id, ...data } = updateVehicle;
    return this.vehicleService.update({ id }, data);
  }

  //@Delete(':id')
  @GrpcMethod('VehicleService')
  async remove(id: VehicleById): Promise<Vehicle> {
    return this.vehicleService.remove(id);
  }
}
