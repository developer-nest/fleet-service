/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, VehicleStatusHistory } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
  VehicleStatusFilter,
  VehicleStatusHistoryList,
} from './interfaces/vehicle-status-history.interface';

@Injectable()
export class VehicleStatusHistoryService {
  constructor(private prisma: PrismaService) {}
  async create(
    data: Prisma.VehicleStatusHistoryUncheckedCreateInput,
  ): Promise<VehicleStatusHistory> {
    try {
      const [statusHistory] = await this.prisma.$transaction([
        this.prisma.vehicleStatusHistory.create({
          data: {
            status: data.status,
            returnDate: data.returnDate,
            vehicleId: data.vehicleId,
          },
        }),
        // 2. Actualizar la situación actual en Driver
        this.prisma.vehicle.update({
          where: { id: data.vehicleId },
          data: { currentSituation: data.status },
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
  ): Promise<VehicleStatusHistoryList> {
    try {
      const {
        limit = 10,
        page = 1,
        date,
        vehicleId,
        status,
      } = vehicleStatusFilter;

      const isValidDate = !isNaN(Date.parse(date as string));

      const where: Prisma.VehicleStatusHistoryWhereInput = {
        ...(vehicleId && { vehicleId }),
        ...(status && { status }),
        ...(date &&
          isValidDate && {
            date: {
              gte: new Date(`${date}T00:00:00.000Z`),
              lt: new Date(`${date}T23:59:59.999Z`),
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

  async findOne(where: Prisma.VehicleStatusHistoryWhereUniqueInput) {
    try {
      const statusHistory = await this.prisma.vehicleStatusHistory.findUnique({
        where,
      });

      if (!statusHistory) {
        throw new RpcException({
          message: `StatusHistory with id ${where.id} not found`,
          code: status.NOT_FOUND,
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

  // update(
  //   id: number,
  //   updateVehicleStatusHistoryDto: UpdateVehicleStatusHistoryDto,
  // ) {
  //   return `This action updates a #${id} vehicleStatusHistory`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} vehicleStatusHistory`;
  // }
}
