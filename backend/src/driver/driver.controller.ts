import { Controller, Patch, Param, Body, UseGuards, Get, Post, Request } from '@nestjs/common';
import { DriverService } from './driver.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateParcelStatusDto } from './dto/update-parcel-status.dto';
import { UpdateDriverProfileDto } from './dto/update-driver-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorators/role.decorator';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('DRIVER')
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  // Get driver's assigned parcels
  @Get('parcels')
  async getDriverParcels(@Request() req) {
    const driverId = req.user.id;
    return this.driverService.getDriverParcels(driverId);
  }

  // Get driver profile
  @Get('profile')
  async getDriverProfile(@Request() req) {
    const driverId = req.user.id;
    return this.driverService.getDriverProfile(driverId);
  }

  // Update driver profile
  @Patch('profile')
  async updateDriverProfile(@Request() req, @Body() updateData: UpdateDriverProfileDto) {
    const driverId = req.user.id;
    return this.driverService.updateDriverProfile(driverId, updateData);
  }

  // Get driver statistics
  @Get('stats')
  async getDriverStats(@Request() req) {
    const driverId = req.user.id;
    return this.driverService.getDriverStats(driverId);
  }

  // Update parcel location
  @Patch('parcels/:id/location')
  async updateParcelLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.driverService.updateParcelLocation(Number(id), dto);
  }

  // Update parcel status
  @Patch('parcels/:id/status')
  async updateParcelStatus(@Param('id') id: string, @Body() dto: UpdateParcelStatusDto) {
    return this.driverService.updateParcelStatus(Number(id), dto);
  }

  // Get nearby parcels for driver
  @Get('nearby-parcels')
  async getNearbyParcels(@Request() req, @Body() location: { lat: number; lng: number; radius?: number }) {
    const driverId = req.user.id;
    return this.driverService.getNearbyParcels(driverId, location.lat, location.lng, location.radius);
  }

  // Accept parcel assignment
  @Post('parcels/:id/accept')
  async acceptParcel(@Request() req, @Param('id') id: string) {
    const driverId = req.user.id;
    return this.driverService.acceptParcel(driverId, Number(id));
  }
}
