import { Module } from '@nestjs/common';
import { DriverVehiclesService } from './driver-vehicles.service';
import { DriverVehiclesController } from './driver-vehicles.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [DriverVehiclesController],
  providers: [DriverVehiclesService, PrismaService],
})
export class DriverVehiclesModule {}
