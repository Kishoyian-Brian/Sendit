import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AppMailerModule } from '../mailer/mailer.module';

@Module({
  imports: [AppMailerModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
