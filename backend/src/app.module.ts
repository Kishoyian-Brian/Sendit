import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { DriverModule } from './driver/driver.module';
import { ParcelModule } from './parcel/parcel.module';
import { TrackingModule } from './tracking/tracking.module';
import { AppMailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AdminModule,
    DriverModule,
    ParcelModule,
    TrackingModule,
    AppMailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
