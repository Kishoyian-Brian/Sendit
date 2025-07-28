import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailerModule } from './mailer/mailer.module';
import { AdminModule } from './admin/admin.module';
import { DriverModule } from './driver/driver.module';
import { ParcelModule } from './parcel/parcel.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MailerModule,
    AdminModule,
    DriverModule,
    ParcelModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
