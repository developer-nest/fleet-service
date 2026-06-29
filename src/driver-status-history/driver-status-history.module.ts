import { Module } from '@nestjs/common';
import { DriverStatusHistoryService } from './driver-status-history.service';
import { DriverStatusHistoryController } from './driver-status-history.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [DriverStatusHistoryController],
  providers: [DriverStatusHistoryService, PrismaService],
})
export class DriverStatusHistoryModule {}
