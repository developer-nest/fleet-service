import { Module } from '@nestjs/common';
import { DriverModule } from './driver/driver.module';
import { VehicleStatusHistoryModule } from './vehicle-status-history/vehicle-status-history.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { DriverVehiclesModule } from './driver-vehicles/driver-vehicles.module';
import { DriverStatusHistoryModule } from './driver-status-history/driver-status-history.module';

@Module({
  imports: [
    VehicleStatusHistoryModule,
    VehicleModule,
    DriverVehiclesModule,
    DriverModule,
    DriverStatusHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
