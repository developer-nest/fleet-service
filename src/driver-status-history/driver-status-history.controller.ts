/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DriverStatusHistoryService } from './driver-status-history.service';
import { ById, toIsoStringOrEmpty } from 'src/common';
import {
  CreateDriverStatus,
  DriverStatusFilter,
  DriverStatusHistoryList,
  DriverStatusHistoryResponse,
} from './interfaces/driver-status-history.interface';

@Controller()
export class DriverStatusHistoryController {
  constructor(
    private readonly driverStatusHistoryService: DriverStatusHistoryService,
  ) {}

  @GrpcMethod('DriverStatusService')
  async create(data: CreateDriverStatus): Promise<DriverStatusHistoryResponse> {
    const result = await this.driverStatusHistoryService.create(data);
    return this.toResponse(result);
  }

  @GrpcMethod('DriverStatusService')
  async findAll(
    driverStatusFilter: DriverStatusFilter,
  ): Promise<DriverStatusHistoryList> {
    const result =
      await this.driverStatusHistoryService.findAll(driverStatusFilter);
    return {
      ...result,
      items: result.items.map((item) => this.toResponse(item)), // 👈 conversión real
    };
  }

  @GrpcMethod('DriverStatusService')
  async findOne(data: ById): Promise<DriverStatusHistoryResponse | null> {
    const result = await this.driverStatusHistoryService.findOne({
      id: data.id,
    });
    return result ? this.toResponse(result) : null;
  }

  private toResponse(entity: {
    id: string;
    date: Date;
    status: string;
    returnDate: Date | null;
    driverId: string;
  }): DriverStatusHistoryResponse {
    return {
      id: entity.id,
      date: toIsoStringOrEmpty(entity.date),
      status: entity.status as any,
      returnDate: toIsoStringOrEmpty(entity.returnDate),
      driverId: entity.driverId,
    };
  }

  // @MessagePattern('updateDriverStatusHistory')
  // update(@Payload() updateDriverStatusHistoryDto: UpdateDriverStatusHistoryDto) {
  //   return this.driverStatusHistoryService.update(updateDriverStatusHistoryDto.id, updateDriverStatusHistoryDto);
  // }

  // @MessagePattern('removeDriverStatusHistory')
  // remove(@Payload() id: number) {
  //   return this.driverStatusHistoryService.remove(id);
  // }
}
