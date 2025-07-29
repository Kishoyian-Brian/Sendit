import { Module } from '@nestjs/common';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { TrackingModule } from '../tracking/tracking.module';
import { AppMailerModule } from '../mailer/mailer.module';

@Module({
  imports: [TrackingModule, AppMailerModule],
  controllers: [DriverController],
  providers: [DriverService],
})
export class DriverModule {}
