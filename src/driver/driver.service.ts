/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Driver, DriverSituation, Prisma } from 'src/generated/prisma/client';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  CreateDriverDto,
  DriverList,
  StatusDriverPagination,
  UpdateDriver,
} from './interfaces/driver.interface';
import { ById } from 'src/common';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDriverDto): Promise<Driver> {
    const { fixedVehicleId, currentSituation, ...rest } = data;

    const initialStatus = currentSituation ?? DriverSituation.AVAILABLE;

    this.handleDetectionNotStatus(initialStatus);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Crear el driver
        const driver = await tx.driver.create({
          data: {
            ...rest,
            currentSituation: initialStatus,
            ...(fixedVehicleId && {
              fixedVehicleId,
            }),
          },
        });

        await tx.driverStatusHistory.create({
          data: {
            status: initialStatus,
            driverId: driver.id,
          },
        });

        return driver;
      });
    } catch (error) {
      console.log('P2002 meta:', JSON.stringify(error?.meta));
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error, fixedVehicleId);
    }
  }
  //mejorar este endpoint
  async findAll(
    statusDriverPagination: StatusDriverPagination,
  ): Promise<DriverList> {
    try {
      const { limit = 10, page = 1, isActive, status } = statusDriverPagination;

      const where: Prisma.DriverWhereInput = {
        ...(isActive !== undefined && { isActive }),
        ...(status && { currentSituation: status }),
      };

      const [drivers, total] = await Promise.all([
        this.prisma.driver.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.driver.count({
          where,
        }),
      ]);

      return {
        items: drivers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(data: ById): Promise<Driver> {
    try {
      const driver = await this.prisma.driver.findUnique({
        where: { id: data.id },
        // include: {
        //   fixedVehicle: true,
        //   statusHistory: true,
        // },
      });

      if (!driver || !driver.isActive) {
        throw new RpcException({
          message: `Driver with id ${data.id} not found`,
          code: status.NOT_FOUND,
        });
      }

      return driver;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  async update(updateDriver: UpdateDriver): Promise<Driver> {
    const { id, fixedVehicleId, currentSituation, ...rest } = updateDriver;
    await this.findOne({ id });

    if (currentSituation) {
      this.handleDetectionNotStatus(currentSituation);
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const driver = await tx.driver.update({
          where: { id },
          data: {
            ...rest,
            ...(currentSituation && { currentSituation }),
            ...(fixedVehicleId !== undefined && {
              fixedVehicleId: fixedVehicleId === 'null' ? null : fixedVehicleId,
            }),
          },
        });
        if (currentSituation) {
          await tx.driverStatusHistory.create({
            data: {
              status: currentSituation,
              driverId: driver.id,
            },
          });
        }

        return driver;
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error, fixedVehicleId);
    }
  }

  async remove(data: ById): Promise<Driver> {
    await this.findOne({ id: data.id });

    try {
      return this.prisma.driver.update({
        where: { id: data.id },
        data: { isActive: false },
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  private handleDetectionNotStatus(initialStatus: DriverSituation | undefined) {
    // Si crean con VACATION o INTERIOR sin returnDate, debe fallar también
    const requiresReturnDate =
      initialStatus === DriverSituation.VACATION ||
      initialStatus === DriverSituation.INTERIOR;

    if (requiresReturnDate) {
      // si no hay forma de pasar returnDate en create, podrías no permitir crear directamente con estas situaciones
      throw new RpcException({
        message: `No se puede crear un conductor con situación ${initialStatus} sin fecha de regreso`,
        code: status.INVALID_ARGUMENT,
      });
    }
  }

  private handlePrismaError(error: any, fixedVehicleId?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new RpcException({
          message: `Violación de restricción única en el conductor`, // también corregí "cgofer" (typo)
          code: status.ALREADY_EXISTS,
        });
      }

      if (error.code === 'P2025') {
        throw new RpcException({
          message: `El chofer no existe`,
          code: status.NOT_FOUND,
        });
      }

      if (error.code === 'P2003') {
        throw new RpcException({
          message: `El vehículo con id ${fixedVehicleId} no existe`, // 👈 corregido
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
