/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Driver, DriverSituation, Prisma } from 'src/generated/prisma/client';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  DriverList,
  StatusDriverPagination,
} from './interfaces/driver.interface';
import { captureRejectionSymbol } from 'node:events';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.DriverUncheckedCreateInput): Promise<Driver> {
    const { fixedVehicleId, currentSituation, statusHistory, ...rest } = data;

    const initialStatus = currentSituation ?? DriverSituation.AVAILABLE;

    this.handleDetectionNotStatus(initialStatus, statusHistory);

    // const initialStatus = currentSituation ?? DriverSituation.AVAILABLE;

    // // Si crean con VACATION o INTERIOR sin returnDate, debe fallar también
    // const requiresReturnDate =
    //   initialStatus === DriverSituation.VACATION ||
    //   initialStatus === DriverSituation.INTERIOR;

    // if (requiresReturnDate && !data.statusHistory) {
    //   // si no hay forma de pasar returnDate en create, podrías no permitir crear directamente con estas situaciones
    //   throw new RpcException({
    //     message: `No se puede crear un conductor con situación ${initialStatus} sin fecha de regreso`,
    //     code: status.INVALID_ARGUMENT,
    //   });
    // }

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
      this.handlePrismaError(error, data.idCard, fixedVehicleId);
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

  async findOne(where: Prisma.DriverWhereUniqueInput): Promise<any> {
    const driver = await this.prisma.driver.findUnique({
      where,
      include: {
        fixedVehicle: true,
        statusHistory: true,
      },
    });

    if (!driver || !driver.isActive) {
      throw new RpcException({
        message: `Driver with id ${where.id} not found`,
        code: status.NOT_FOUND,
      });
    }
    return {
      ...driver,
      statusHistory: driver.statusHistory.map((h) => ({
        id: h.id,
        date: h.date.toISOString(),
        status: h.status,
        returnDate: h.returnDate?.toISOString() ?? '',
        driverId: h.driverId,
      })),
    };
  }

  // async findOne(where: Prisma.DriverWhereUniqueInput): Promise<Driver | null> {

  //   console.log('--- ENTRANDO AL MÉTODO ---');
  //   const driver = await this.prisma.driver.findFirst({
  //     where: { ...where, isActive: true },
  //   });

  //   if (!driver)
  //     throw new RpcException({
  //       message: `Driver with id ${where.id} not found`,
  //       statusCode: HttpStatus.BAD_REQUEST,
  //     });
  //   return driver;
  // }

  async update(
    where: Prisma.DriverWhereUniqueInput,
    data: Prisma.DriverUncheckedUpdateInput,
  ): Promise<Driver> {
    await this.findOne(where);
    const { fixedVehicleId, currentSituation, statusHistory, ...rest } =
      data as any;

    if (currentSituation) {
      this.handleDetectionNotStatus(currentSituation, statusHistory);
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const driver = await tx.driver.update({
          where: { id: where.id },
          data: {
            ...rest,
            ...(currentSituation && { currentSituation }),
            //fixedVehicleId es un string con valor → conectar
            ...(fixedVehicleId &&
              fixedVehicleId !== 'null' && {
                fixedVehicleId,
              }),
            // fixedVehicleId viene como 'null' string → desconectar
            ...(fixedVehicleId === 'null' && {
              fixedVehicle: null,
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
      this.handlePrismaError(
        error,
        data.idCard as string,
        fixedVehicleId as string,
      );
    }
  }

  async remove(where: Prisma.DriverWhereUniqueInput): Promise<Driver> {
    await this.findOne(where);

    // if (!driver)
    //   throw new RpcException({
    //     message: `Driver with id ${where.id} not found`,
    //     statusCode: HttpStatus.BAD_REQUEST,
    //   });

    return this.prisma.driver.update({
      where: { id: where.id },
      data: { isActive: false },
    });
  }

  private handleDetectionNotStatus(
    initialStatus: DriverSituation | undefined,
    statusHistory: any,
  ) {
    // Si crean con VACATION o INTERIOR sin returnDate, debe fallar también
    const requiresReturnDate =
      initialStatus === DriverSituation.VACATION ||
      initialStatus === DriverSituation.INTERIOR;

    if (requiresReturnDate && !statusHistory) {
      // si no hay forma de pasar returnDate en create, podrías no permitir crear directamente con estas situaciones
      throw new RpcException({
        message: `No se puede crear un conductor con situación ${initialStatus} sin fecha de regreso`,
        code: status.INVALID_ARGUMENT,
      });
    }
  }

  private handlePrismaError(
    error: any,
    idCard?: string,
    fixedVehicleId?: string | null,
  ): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const originalMessage: string =
          (error.meta?.driverAdapterError as any)?.cause?.originalMessage ?? '';
        const fields = Array.isArray(error.meta?.target)
          ? (error.meta.target as string[]).join(',')
          : '';

        const isIdCard =
          fields.includes('id_card') ||
          fields.includes('idCard') ||
          originalMessage.includes('id_card');

        const isFixedVehicle =
          fields.includes('fixed_vehicle_id') ||
          fields.includes('fixedVehicleId') ||
          originalMessage.includes('fixed_vehicle_id');

        if (isIdCard) {
          throw new RpcException({
            message: `Ya existe un conductor con la cédula ${idCard}`,
            code: status.ALREADY_EXISTS,
          });
        }

        if (isFixedVehicle) {
          throw new RpcException({
            message: `El vehículo ${fixedVehicleId} ya tiene un conductor fijo asignado`,
            code: status.ALREADY_EXISTS,
          });
        }

        throw new RpcException({
          message: `Violación de restricción única`,
          code: status.ALREADY_EXISTS,
        });
      }

      if (error.code === 'P2025') {
        throw new RpcException({
          message: `El vehículo con id ${fixedVehicleId} no existe`,
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
