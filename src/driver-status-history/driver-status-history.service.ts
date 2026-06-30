/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DriverSituation, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { DriverStatusHistory } from 'src/generated/prisma/client';
import { RpcException } from '@nestjs/microservices';
import { status as statusError } from '@grpc/grpc-js';
import {
  DriverStatusFilter,
  DriverStatusHistoryList,
} from './interfaces/driver-status-history.interface';

@Injectable()
export class DriverStatusHistoryService {
  constructor(private prisma: PrismaService) {}
  async create(
    data: Prisma.DriverStatusHistoryUncheckedCreateInput,
  ): Promise<DriverStatusHistory> {
    const { status, returnDate, driverId } = data;
    const requiresReturnDate =
      status === DriverSituation.VACATION ||
      status === DriverSituation.INTERIOR;

    if (requiresReturnDate && !returnDate) {
      throw new RpcException({
        message: `La situación ${status} requiere fecha de regreso`,
        code: statusError.INVALID_ARGUMENT,
      });
    }
    try {
      const [statusHistory] = await this.prisma.$transaction([
        this.prisma.driverStatusHistory.create({
          data: {
            status,
            returnDate: requiresReturnDate ? returnDate : null,
            driverId,
          },
        }),
        // 2. Actualizar la situación actual en Driver
        this.prisma.driver.update({
          where: { id: data.driverId },
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
    driverStatusFilter: DriverStatusFilter,
  ): Promise<DriverStatusHistoryList> {
    try {
      const {
        limit = 10,
        page = 1,
        date,
        driverId,
        status,
      } = driverStatusFilter;

      const isValidDate = !isNaN(Date.parse(date as string));

      const where: Prisma.DriverStatusHistoryWhereInput = {
        ...(driverId && { driverId }),
        ...(status && { status }),
        ...(date &&
          isValidDate && {
            date: {
              gte: new Date(`${date}T00:00:00.000Z`),
              lt: new Date(`${date}T23:59:59.999Z`),
            },
          }),
      };

      const [driverStatus, total] = await Promise.all([
        this.prisma.driverStatusHistory.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { date: 'desc' },
        }),
        this.prisma.driverStatusHistory.count({
          where,
        }),
      ]);
      return {
        items: driverStatus,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(where: Prisma.DriverStatusHistoryWhereUniqueInput) {
    try {
      const statusHistory = await this.prisma.driverStatusHistory.findUnique({
        where,
        include: {
          driver: true,
        },
      });

      if (!statusHistory) {
        throw new RpcException({
          message: `StatusHistory with id ${where.id} not found`,
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

  // update(id: number, updateDriverStatusHistoryDto: UpdateDriverStatusHistoryDto) {
  //   return `This action updates a #${id} driverStatusHistory`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} driverStatusHistory`;
  // }
}
