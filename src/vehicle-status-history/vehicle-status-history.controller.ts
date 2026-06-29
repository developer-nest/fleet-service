/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VehicleStatusHistoryService } from './vehicle-status-history.service';
import {
  CreateVehicleStatus,
  VehicleStatusFilter,
  VehicleStatusHistoryList,
} from './interfaces/vehicle-status-history.interface';
import { VehicleStatusHistory } from 'src/generated/prisma/client';
import { ById } from 'src/common';

@Controller()
export class VehicleStatusHistoryController {
  constructor(
    private readonly vehicleStatusHistoryService: VehicleStatusHistoryService,
  ) {}

  @GrpcMethod('VehicleStatusService')
  create(data: CreateVehicleStatus): Promise<VehicleStatusHistory> {
    return this.vehicleStatusHistoryService.create(data);
  }

  @GrpcMethod('VehicleStatusService')
  findAll(
    vehicleStatusFilter: VehicleStatusFilter,
  ): Promise<VehicleStatusHistoryList> {
    return this.vehicleStatusHistoryService.findAll(vehicleStatusFilter);
  }

  @GrpcMethod('VehicleStatusService')
  findOne(data: ById): Promise<VehicleStatusHistory | null> {
    return this.vehicleStatusHistoryService.findOne({ id: data.id });
  }

  // @MessagePattern('updateVehicleStatusHistory')
  // update() {
  //   return this.vehicleStatusHistoryService.update(updateVehicleStatusHistoryDto.id, updateVehicleStatusHistoryDto);
  // }

  // @MessagePattern('removeVehicleStatusHistory')
  // remove(@Payload() id: number) {
  //   return this.vehicleStatusHistoryService.remove(id);
  // }
}
