/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { status as statusError } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CarStatus,
  Prisma,
  VehicleStatusHistory,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  CreateVehicleStatus,
  VehicleStatusFilter,
  VehicleStatusHistoryList,
  VehicleStatusHistoryListPrisma,
} from './interfaces/vehicle-status-history.interface';
import { ById, toDateOrNull } from 'src/common';

@Injectable()
export class VehicleStatusHistoryService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreateVehicleStatus): Promise<VehicleStatusHistory> {
    const { status, returnDate, vehicleId } = data;
    const requiresReturnDate = status === CarStatus.INTERIOR;
    if (requiresReturnDate && !returnDate) {
      throw new RpcException({
        message: `La situación ${status} requiere fecha de regreso`,
        code: statusError.INVALID_ARGUMENT,
      });
    }

    const parsedReturnDate = requiresReturnDate
      ? toDateOrNull(returnDate)
      : null;
    try {
      const [statusHistory] = await this.prisma.$transaction([
        this.prisma.vehicleStatusHistory.create({
          data: {
            status,
            returnDate: parsedReturnDate,
            vehicleId,
          },
        }),
        // 2. Actualizar la situación actual en Driver
        this.prisma.vehicle.update({
          where: { id: vehicleId },
          data: { currentSituation: status },
        }),
      ]);

      return statusHistory;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  async findAll(
    vehicleStatusFilter: VehicleStatusFilter,
  ): Promise<VehicleStatusHistoryListPrisma> {
    try {
      const {
        limit = 10,
        page = 1,
        date,
        vehicleId,
        status,
      } = vehicleStatusFilter;

      const parsedDate = toDateOrNull(date);
      const where: Prisma.VehicleStatusHistoryWhereInput = {
        ...(vehicleId && { vehicleId }),
        ...(status && { status }),
        ...(parsedDate && {
          date: {
            gte: parsedDate,
            lt: new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000), // +1 día
          },
        }),
      };

      const [vehicleStatus, total] = await Promise.all([
        this.prisma.vehicleStatusHistory.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { date: 'desc' },
        }),
        this.prisma.vehicleStatusHistory.count({
          where,
        }),
      ]);
      return {
        items: vehicleStatus,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(data: ById) {
    try {
      const statusHistory = await this.prisma.vehicleStatusHistory.findUnique({
        where: { id: data.id },
      });

      if (!statusHistory) {
        throw new RpcException({
          message: `StatusHistory with id ${data.id} not found`,
          code: statusError.NOT_FOUND,
        });
      }
      return statusHistory;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new RpcException({
          message: `Violación de restricción única en historial de conductor`,
          code: statusError.ALREADY_EXISTS,
        });
      }
      if (error.code === 'P2025') {
        throw new RpcException({
          message: `Conductor no encontrado`, // ← correcto para este service
          code: statusError.NOT_FOUND,
        });
      }
      if (error.code === 'P2003') {
        throw new RpcException({
          message: `Error de integridad referencial`,
          code: statusError.FAILED_PRECONDITION,
        });
      }
    }
    throw new RpcException({
      message: 'Error interno del servidor',
      code: statusError.INTERNAL,
    });
  }
}
