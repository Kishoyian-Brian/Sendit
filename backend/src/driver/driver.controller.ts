import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { DriverService } from './driver.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Patch('parcels/:id/location')
  async updateParcelLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.driverService.updateParcelLocation(Number(id), dto);
  }
}
