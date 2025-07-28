import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { AppMailerModule } from '../mailer/mailer.module';

@Module({
  imports: [AppMailerModule],
  controllers: [ContactController],
})
export class ContactModule {} 