/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DriverVehicle, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  DriverStatusFilter,
  DriverVehicleList,
} from './interfaces/driver-vehicles.interface';
import { DriverVehicleWhereUniqueInput } from 'src/generated/prisma/models';

@Injectable()
export class DriverVehiclesService {
  constructor(private prisma: PrismaService) {}
  async assign(
    data: Prisma.DriverVehicleUncheckedCreateInput,
  ): Promise<DriverVehicle> {
    try {
      return await this.prisma.driverVehicle.create({ data });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  async findAll(
    driverStatusFilter: DriverStatusFilter,
  ): Promise<DriverVehicleList> {
    try {
      const {
        limit = 10,
        page = 1,
        date,
        driverId,
        vehicleId,
      } = driverStatusFilter;

      const isValidDate = !isNaN(Date.parse(date as string));
      const where: Prisma.DriverVehicleWhereInput = {
        ...(driverId && { driverId }),
        ...(vehicleId && { vehicleId }),
        ...(date &&
          isValidDate && {
            date: {
              gte: new Date(`${date}T00:00:00.000Z`),
              lt: new Date(`${date}T23:59:59.999Z`),
            },
          }),
      };

      const [driverVehicle, total] = await Promise.all([
        this.prisma.driverVehicle.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { date: 'desc' },
        }),
        this.prisma.driverVehicle.count({
          where,
        }),
      ]);
      return {
        items: driverVehicle,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(where: DriverVehicleWhereUniqueInput): Promise<DriverVehicle> {
    try {
      const driverVehicle = await this.prisma.driverVehicle.findUnique({
        where,
      });

      if (!driverVehicle) {
        throw new RpcException({
          message: `DriverVehicle  with id ${where.id} not found`,
          code: status.NOT_FOUND,
        });
      }

      return driverVehicle;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  // update(id: number, updateDriverVehicleDto: UpdateDriverVehicleDto) {
  //   return `This action updates a #${id} driverVehicle`;
  // }

  async remove(where: DriverVehicleWhereUniqueInput) {
    await this.findOne(where);
    return this.prisma.driverVehicle.delete({ where });
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new RpcException({
          message: `Violación de restricción única en historial de conductor`,
          code: status.ALREADY_EXISTS,
        });
      }
      if (error.code === 'P2025') {
        throw new RpcException({
          message: `Conductor no encontrado`, // ← correcto para este service
          code: status.NOT_FOUND,
        });
      }
      if (error.code === 'P2003') {
        throw new RpcException({
          message: `Error de integridad referencial`,
          code: status.FAILED_PRECONDITION,
        });
      }
    }
    throw new RpcException({
      message: 'Error interno del servidor',
      code: status.INTERNAL,
    });
  }
}
