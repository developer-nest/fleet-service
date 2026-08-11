/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

import { GrpcMethod } from '@nestjs/microservices';

import {
  AvailabilityFilter,
  CreateVehicle,
  StatusVehiclePagination,
  UpdateVehicle,
  VehicleAvailabilityList,
  VehicleList,
} from './interfaces/vehicle.interface';
import { Vehicle } from 'src/generated/prisma/client';
import { toVehicleResponse } from './mappers/vehicle.mapper';
import { ById } from 'src/common';

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

  @GrpcMethod('VehicleService')
  async findAvailableByDate(
    data: AvailabilityFilter,
  ): Promise<VehicleAvailabilityList> {
    const items = await this.vehicleService.findAvailableByDate(data.date);
    return {
      items: items.map(toVehicleResponse), // usa tu mapper existente de Vehicle
    };
  }

  //@Get(':id')
  @GrpcMethod('VehicleService')
  async findOne(id: ById): Promise<Vehicle | null> {
    return this.vehicleService.findOne(id);
  }

  //@Patch(':id')
  @GrpcMethod('VehicleService')
  async update(updateVehicle: UpdateVehicle): Promise<Vehicle> {
    return this.vehicleService.update(updateVehicle);
  }

  //@Delete(':id')
  @GrpcMethod('VehicleService')
  async remove(id: ById): Promise<Vehicle> {
    return this.vehicleService.remove(id);
  }
}
