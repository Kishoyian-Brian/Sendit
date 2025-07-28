import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Parcels
  @Get('parcels')
  getParcels() {
    return this.adminService.getParcels();
  }

  @Post('parcels')
  createParcel(@Body() dto: CreateParcelDto) {
    return this.adminService.createParcel(dto);
  }

  @Patch('parcels/:id')
  updateParcel(@Param('id') id: string, @Body() update: UpdateParcelDto) {
    return this.adminService.updateParcel(id, update);
  }

  @Delete('parcels/:id')
  deleteParcel(@Param('id') id: string) {
    return this.adminService.deleteParcel(id);
  }

  // Drivers
  @Get('drivers')
  getDrivers() {
    return this.adminService.getDrivers();
  }

  // Stats
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
