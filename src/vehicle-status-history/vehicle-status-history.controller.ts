/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VehicleStatusHistoryService } from './vehicle-status-history.service';
import {
  CreateVehicleStatus,
  VehicleStatusFilter,
  VehicleStatusHistoryList,
  VehicleStatusHistoryResponse,
} from './interfaces/vehicle-status-history.interface';
import { ById } from 'src/common';
import { toVehicleStatusHistoryResponse } from './mappers/vehicle-status-history.mapper';

@Controller()
export class VehicleStatusHistoryController {
  constructor(
    private readonly vehicleStatusHistoryService: VehicleStatusHistoryService,
  ) {}

  @GrpcMethod('VehicleStatusService')
  async create(
    data: CreateVehicleStatus,
  ): Promise<VehicleStatusHistoryResponse> {
    const result = await this.vehicleStatusHistoryService.create(data);
    return toVehicleStatusHistoryResponse(result);
  }

  @GrpcMethod('VehicleStatusService')
  async findAll(
    vehicleStatusFilter: VehicleStatusFilter,
  ): Promise<VehicleStatusHistoryList> {
    const result =
      await this.vehicleStatusHistoryService.findAll(vehicleStatusFilter);
    return {
      ...result,
      items: result.items.map(toVehicleStatusHistoryResponse), // 👈 conversión real
    };
  }

  @GrpcMethod('VehicleStatusService')
  async findOne(data: ById): Promise<VehicleStatusHistoryResponse | null> {
    const result = await this.vehicleStatusHistoryService.findOne({
      id: data.id,
    });
    return result ? toVehicleStatusHistoryResponse(result) : null;
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
