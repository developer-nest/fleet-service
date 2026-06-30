/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  StatusVehiclePagination,
  VehicleList,
} from './interfaces/vehicle.interface';
import { CarStatus, Prisma, Vehicle } from 'src/generated/prisma/client';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.VehicleUncheckedCreateInput): Promise<Vehicle> {
    const { currentSituation, statusHistory, ...rest } = data;
    const initialStatus = currentSituation ?? CarStatus.AVAILABLE;
    this.handleDetectionNotStatus(initialStatus, statusHistory);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.create({
          data: {
            ...rest,
            currentSituation: initialStatus,
          },
        });

        await tx.vehicleStatusHistory.create({
          data: {
            status: initialStatus,
            vehicleId: vehicle.id,
          },
        });
        return vehicle;
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error, data.numCar);
    }
  }

  async findAll(
    statusVehiclePagination: StatusVehiclePagination,
  ): Promise<VehicleList> {
    console.log(statusVehiclePagination);
    try {
      const {
        limit = 10,
        page = 1,
        isActive,
        status,
      } = statusVehiclePagination;

      const where: Prisma.VehicleWhereInput = {
        ...(isActive !== undefined && { isActive }),
        ...(status && { currentSituation: status }),
      };

      const [vehicles, total] = await Promise.all([
        this.prisma.vehicle.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.vehicle.count({
          where,
        }),
      ]);

      return {
        items: vehicles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(where: Prisma.VehicleWhereUniqueInput): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where,
      include: { fixedDriver: true },
    });

    // Verifica que existe y que está activo
    if (!vehicle || !vehicle.isActive) {
      throw new RpcException({
        message: `Vehicle with id ${where.id} not found`,
        code: status.NOT_FOUND,
      });
    }
    return vehicle;
  }

  async update(
    where: Prisma.VehicleWhereUniqueInput,
    data: Prisma.VehicleUncheckedUpdateInput,
  ): Promise<Vehicle> {
    await this.findOne(where);
    const { currentSituation, statusHistory, ...rest } = data as any;

    if (currentSituation) {
      this.handleDetectionNotStatus(currentSituation, statusHistory);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.update({
          where: { id: where.id },
          data: {
            ...rest,
            ...(currentSituation && { currentSituation }),
          },
        });
        if (currentSituation) {
          await tx.vehicleStatusHistory.create({
            data: {
              status: currentSituation,
              vehicleId: vehicle.id,
            },
          });
        }

        return vehicle;
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error, data.numCar as string);
    }
  }

  async remove(where: Prisma.VehicleWhereUniqueInput): Promise<Vehicle> {
    await this.findOne(where);

    return this.prisma.vehicle.update({
      where: { id: where.id },
      data: { isActive: false }, // solo cambia isActive, sin tocar situación ni historial
    });
  }

  private handleDetectionNotStatus(
    initialStatus: CarStatus | undefined,
    statusHistory: any,
  ) {
    // Si crean con VACATION o INTERIOR sin returnDate, debe fallar también
    const requiresReturnDate = initialStatus === CarStatus.INTERIOR;

    if (requiresReturnDate && !statusHistory) {
      // si no hay forma de pasar returnDate en create, podrías no permitir crear directamente con estas situaciones
      throw new RpcException({
        message: `No se puede crear un vehiculo con situación ${initialStatus} sin fecha de regreso`,
        code: status.INVALID_ARGUMENT,
      });
    }
  }

  private handlePrismaError(error: any, numCar?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new RpcException({
          message: `Ya existe un vehículo con número ${numCar}`,
          code: status.ALREADY_EXISTS,
        });
      }
      if (error.code === 'P2025') {
        throw new RpcException({
          message: `Vehículo no encontrado`,
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
