import { Module } from '@nestjs/common';
import { VehicleStatusHistoryService } from './vehicle-status-history.service';
import { VehicleStatusHistoryController } from './vehicle-status-history.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [VehicleStatusHistoryController],
  providers: [VehicleStatusHistoryService, PrismaService],
})
export class VehicleStatusHistoryModule {}
