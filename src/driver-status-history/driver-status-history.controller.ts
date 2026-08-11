/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DriverStatusHistoryService } from './driver-status-history.service';
import { ById } from 'src/common';
import {
  CreateDriverStatus,
  DriverStatusFilter,
  DriverStatusHistoryList,
  DriverStatusHistoryResponse,
} from './interfaces/driver-status-history.interface';
import { toDriverStatusHistoryResponse } from './mappers/driver-status-history.mapper';

@Controller()
export class DriverStatusHistoryController {
  constructor(
    private readonly driverStatusHistoryService: DriverStatusHistoryService,
  ) {}

  @GrpcMethod('DriverStatusService')
  async create(data: CreateDriverStatus): Promise<DriverStatusHistoryResponse> {
    const result = await this.driverStatusHistoryService.create(data);
    return toDriverStatusHistoryResponse(result);
  }

  @GrpcMethod('DriverStatusService')
  async findAll(
    driverStatusFilter: DriverStatusFilter,
  ): Promise<DriverStatusHistoryList> {
    const result =
      await this.driverStatusHistoryService.findAll(driverStatusFilter);
    return {
      ...result,
      items: result.items.map(toDriverStatusHistoryResponse), // 👈 conversión real
    };
  }

  @GrpcMethod('DriverStatusService')
  async findOne(id: ById): Promise<DriverStatusHistoryResponse | null> {
    const result = await this.driverStatusHistoryService.findOne(id);
    return result ? toDriverStatusHistoryResponse(result) : null;
  }
}
