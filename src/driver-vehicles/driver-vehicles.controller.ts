/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DriverVehiclesService } from './driver-vehicles.service';
import {
  AssignDriverVehicles,
  DriverStatusFilter,
  DriverVehicleList,
} from './interfaces/driver-vehicles.interface';
import { DriverVehicle } from 'src/generated/prisma/client';
import { ById } from 'src/common';

@Controller()
export class DriverVehiclesController {
  constructor(private readonly driverVehiclesService: DriverVehiclesService) {}

  @GrpcMethod('DriverVehicleService')
  assign(data: AssignDriverVehicles): Promise<DriverVehicle> {
    return this.driverVehiclesService.assign(data);
  }

  @GrpcMethod('DriverVehicleService')
  findAll(driverStatusFilter: DriverStatusFilter): Promise<DriverVehicleList> {
    return this.driverVehiclesService.findAll(driverStatusFilter);
  }

  @GrpcMethod('DriverVehicleService')
  findOne(data: ById): Promise<DriverVehicle> {
    return this.driverVehiclesService.findOne({ id: data.id });
  }

  // @MessagePattern('updateDriverVehicle')
  // update(@Payload() updateDriverVehicleDto: UpdateDriverVehicleDto) {
  //   return this.driverVehiclesService.update(
  //     updateDriverVehicleDto.id,
  //     updateDriverVehicleDto,
  //   );
  // }

  @GrpcMethod('DriverVehicleService')
  remove(data: ById) {
    return this.driverVehiclesService.remove({ id: data.id });
  }
}
