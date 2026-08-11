/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  StatusVehiclePagination,
  UpdateVehicle,
  VehicleList,
} from './interfaces/vehicle.interface';
import { CarStatus, Prisma, Vehicle } from 'src/generated/prisma/client';
import { ById, toDateRequired } from 'src/common';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.VehicleUncheckedCreateInput): Promise<Vehicle> {
    const { currentSituation, ...rest } = data;
    const initialStatus = currentSituation ?? CarStatus.AVAILABLE;
    this.handleDetectionNotStatus(initialStatus);

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

  async findOne(data: ById): Promise<Vehicle> {
    try {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: data.id },
        include: { fixedDriver: true },
      });

      // Verifica que existe y que está activo
      if (!vehicle || !vehicle.isActive) {
        throw new RpcException({
          message: `Vehicle with id ${data.id} not found`,
          code: status.NOT_FOUND,
        });
      }
      return vehicle;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  async update(updateVehicle: UpdateVehicle): Promise<Vehicle> {
    const { id, currentSituation, ...rest } = updateVehicle;
    await this.findOne({ id });

    if (currentSituation) {
      this.handleDetectionNotStatus(currentSituation);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const vehicle = await tx.vehicle.update({
          where: { id },
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
      this.handlePrismaError(error);
    }
  }

  async remove(data: ById): Promise<Vehicle> {
    await this.findOne({ id: data.id });
    try {
      return this.prisma.vehicle.update({
        where: { id: data.id },
        data: { isActive: false }, // solo cambia isActive, sin tocar situación ni historial
      });
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  private handleDetectionNotStatus(initialStatus: CarStatus | undefined) {
    // Si crean con VACATION o INTERIOR sin returnDate, debe fallar también
    const requiresReturnDate = initialStatus === CarStatus.INTERIOR;

    if (requiresReturnDate) {
      // si no hay forma de pasar returnDate en create, podrías no permitir crear directamente con estas situaciones
      throw new RpcException({
        message: `No se puede crear un vehiculo con situación ${initialStatus} sin fecha de regreso`,
        code: status.INVALID_ARGUMENT,
      });
    }
  }

  async findAvailableByDate(date: string): Promise<Vehicle[]> {
    const parsedDate = toDateRequired(date, 'date');

    try {
      const vehicles = await this.prisma.vehicle.findMany({
        where: { isActive: true },
        include: {
          statusHistory: {
            where: { date: { lte: parsedDate } },
            orderBy: { date: 'desc' },
            take: 1, // solo el estado más reciente ANTES o EN esa fecha
          },
        },
      });

      const available = vehicles.filter((v) => {
        const lastStatus = v.statusHistory[0];

        // Si nunca tuvo historial, confiamos en su situación actual por defecto
        if (!lastStatus) {
          return v.currentSituation === CarStatus.AVAILABLE;
        }

        if (lastStatus.status === CarStatus.AVAILABLE) {
          return true;
        }

        // Si estaba en el interior, solo cuenta como disponible
        // si YA REGRESÓ (su returnDate ya pasó o es igual a la fecha consultada)
        if (lastStatus.status === CarStatus.INTERIOR && lastStatus.returnDate) {
          return lastStatus.returnDate <= parsedDate;
        }

        // WORKSHOP, CITY, OTHER → no disponible
        return false;
      });

      return available;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
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
