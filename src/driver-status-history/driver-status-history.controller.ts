/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DriverStatusHistoryService } from './driver-status-history.service';
import { ById } from 'src/common';
import {
  CreateDriverStatus,
  DriverStatusFilter,
  DriverStatusHistoryList,
} from './interfaces/driver-status-history.interface';
import { DriverStatusHistory } from 'src/generated/prisma/client';

@Controller()
export class DriverStatusHistoryController {
  constructor(
    private readonly driverStatusHistoryService: DriverStatusHistoryService,
  ) {}

  @GrpcMethod('DriverStatusService')
  create(data: CreateDriverStatus): Promise<DriverStatusHistory> {
    return this.driverStatusHistoryService.create(data);
  }

  @GrpcMethod('DriverStatusService')
  findAll(
    driverStatusFilter: DriverStatusFilter,
  ): Promise<DriverStatusHistoryList> {
    return this.driverStatusHistoryService.findAll(driverStatusFilter);
  }

  @GrpcMethod('DriverStatusService')
  async findOne(data: ById): Promise<DriverStatusHistory | null> {
    return await this.driverStatusHistoryService.findOne({ id: data.id });
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
