/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DriverService } from './driver.service';
import { Driver } from 'src/generated/prisma/client';
import {
  CreateDriver,
  DriverById,
  DriverList,
  StatusDriverPagination,
  UpdateDriver,
} from './interfaces/driver.interface';

@Controller('')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  // ─── CREATE ───────────────────────────────────
  // Recibe: { fullName, address, idCard, category, dateIn, dateEnd?, isActive, fixedVehicleId? }
  // Retorna: Driver
  //@MessagePattern('createDriver')
  @GrpcMethod('DriverService')
  async create(data: CreateDriver): Promise<Driver> {
    return this.driverService.create(data);
  }

  //@MessagePattern('findAllDriver')
  // ─── FIND ALL ─────────────────────────────────
  // Recibe: { page, limit, isActive?, situation? }
  // Retorna: DriverList { items, total, page, limit, totalPages }
  @GrpcMethod('DriverService')
  async findAll(
    statusDriverPagination: StatusDriverPagination,
  ): Promise<DriverList> {
    return this.driverService.findAll(statusDriverPagination);
  }

  //@MessagePattern('findOneDriver')
  @GrpcMethod('DriverService')
  // ─── FIND ONE ─────────────────────────────────
  // Recibe: { id }
  // Retorna: DriverDetail { ...driver, fixedVehicle? }
  async findOne(data: DriverById): Promise<any> {
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
    const { id, ...data } = updateDriver;
    return this.driverService.update({ id }, data);
  }

  //@MessagePattern('removeDriver')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  // ─── REMOVE ───────────────────────────────────
  // Soft delete: isActive = false
  // Recibe: { id }
  // Retorna: Driver con isActive = false
  @GrpcMethod('DriverService')
  async remove(id: DriverById): Promise<Driver> {
    return this.driverService.remove(id);
  }
}
