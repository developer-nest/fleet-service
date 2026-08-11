/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DriverService } from './driver.service';
import { Driver } from 'src/generated/prisma/client';
import {
  CreateDriverDto,
  DriverList,
  StatusDriverPagination,
  UpdateDriver,
} from './interfaces/driver.interface';
import { ById } from 'src/common';

@Controller('')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @GrpcMethod('DriverService')
  async create(data: CreateDriverDto): Promise<Driver> {
    return this.driverService.create(data);
  }

  @GrpcMethod('DriverService')
  async findAll(
    statusDriverPagination: StatusDriverPagination,
  ): Promise<DriverList> {
    return this.driverService.findAll(statusDriverPagination);
  }

  @GrpcMethod('DriverService')
  async findOne(data: ById): Promise<Driver> {
    return await this.driverService.findOne({ id: data.id });
  }

  //@MessagePattern('updateDriver')
  // ─── UPDATE ───────────────────────────────────
  // Recibe: { id, ...camposOpcionales, fixedVehicleId? }
  // fixedVehicleId = uuid    → conecta el vehículo
  // fixedVehicleId = 'null'  → desconecta el vehículo
  // fixedVehicleId ausente   → no toca la relación
  // Retorna: Driver
  @GrpcMethod('DriverService')
  async update(updateDriver: UpdateDriver): Promise<Driver> {
    //const { id, ...data } = updateDriver;
    return this.driverService.update(updateDriver);
  }

  //@MessagePattern('removeDriver')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  // ─── REMOVE ───────────────────────────────────
  // Soft delete: isActive = false
  // Recibe: { id }
  // Retorna: Driver con isActive = false
  @GrpcMethod('DriverService')
  async remove(id: ById): Promise<Driver> {
    return this.driverService.remove(id);
  }
}
