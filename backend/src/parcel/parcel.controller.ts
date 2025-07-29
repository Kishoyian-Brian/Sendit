import { Controller, Get, Body, Param, Patch, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ParcelService } from './parcel.service';
import { UpdateParcelDto, ParcelResponseDto } from '../dtos/parcel.dto';
import { ApiResponse, PaginatedResponse } from '../shared/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guards';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { RequirePermissions } from '../auth/decorators/permission';
import { ParcelStats, ParcelSearchFilters } from '../interfaces/parcel.interface';

@Controller('parcel')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('parcel.read')
  async findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
    @Query('senderId') senderId?: string,
    @Query('trackingNumber') trackingNumber?: string,
    @Query('recipientEmail') recipientEmail?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ): Promise<PaginatedResponse<ParcelResponseDto>> {
    const filters: ParcelSearchFilters = {
      status: status as any,
      driverId: driverId ? parseInt(driverId) : undefined,
      senderId: senderId ? parseInt(senderId) : undefined,
      trackingNumber,
      recipientEmail,
      dateFrom,
      dateTo
    };

    const result = await this.parcelService.findAll(parseInt(page), parseInt(pageSize), filters);
    return new PaginatedResponse(result.data, result.total, result.page, result.pageSize);
  }

  @Get('track/:trackingNumber')
  async trackParcel(@Param('trackingNumber') trackingNumber: string): Promise<ApiResponse<any>> {
    try {
      const result = await this.parcelService.findByTrackingNumber(trackingNumber);
      if (result.success) {
        return new ApiResponse(true, result.parcel, 'Parcel found');
      } else {
        return new ApiResponse(false, null, result.message);
      }
    } catch (error) {
      return new ApiResponse(false, null, 'Error tracking parcel');
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('parcel.read')
  async getStats(): Promise<ApiResponse<ParcelStats>> {
    const stats = await this.parcelService.getStats();
    return new ApiResponse(true, stats, 'Parcel statistics retrieved');
  }

  @Get('my-parcels')
  @UseGuards(JwtAuthGuard)
  async getMyParcels(@Req() req): Promise<ApiResponse<ParcelResponseDto[]>> {
    console.log('getMyParcels called with user:', req.user);
    const parcels = await this.parcelService.getParcelsByUser(req.user.userId, req.user.email);
    console.log('Found parcels for user:', parcels.length);
    return new ApiResponse(true, parcels, 'User parcels retrieved');
  }

  @Get('driver-parcels')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('DRIVER')
  async getDriverParcels(@Req() req): Promise<ApiResponse<ParcelResponseDto[]>> {
    const parcels = await this.parcelService.getParcelsByDriver(req.user.userId);
    return new ApiResponse(true, parcels, 'Driver parcels retrieved');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('parcel.read')
  async findOne(@Param('id') id: string): Promise<ApiResponse<ParcelResponseDto>> {
    const parcel = await this.parcelService.findOne(parseInt(id));
    return new ApiResponse(true, parcel, 'Parcel retrieved successfully');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('parcel.update')
  async update(@Param('id') id: string, @Body() dto: UpdateParcelDto): Promise<ApiResponse<ParcelResponseDto>> {
    const parcel = await this.parcelService.update(parseInt(id), dto);
    return new ApiResponse(true, parcel, 'Parcel updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('parcel.delete')
  async remove(@Param('id') id: string): Promise<ApiResponse<null>> {
    await this.parcelService.remove(parseInt(id));
    return new ApiResponse(true, null, 'Parcel deleted successfully');
  }
}
