import { Controller, Get, Post, Body, Param, Patch, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiResponse, PaginatedResponse } from '../shared/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guards';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { RequirePermissions } from '../auth/decorators/permission';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Only admins can create users
  @Post()
  @UseGuards(RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('user.create')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return new ApiResponse(true, user, 'User created');
  }

  // Only admins can list users
  @Get()
  @UseGuards(RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('user.read')
  async findAll(@Query('page') page = '1', @Query('pageSize') pageSize = '10') {
    const result = await this.userService.findAll(Number(page), Number(pageSize));
    return new ApiResponse(true, new PaginatedResponse(result.data, result.total, result.page, result.pageSize));
  }

  // Only admins can get any user by id
  @Get(':id')
  @UseGuards(RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('user.read')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(Number(id));
    return new ApiResponse(true, user);
  }

  // Only admins can update any user
  @Patch(':id')
  @UseGuards(RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('user.update')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(Number(id), dto);
    return new ApiResponse(true, user, 'User updated');
  }

  // Only admins can delete users
  @Delete(':id')
  @UseGuards(RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('user.delete')
  async remove(@Param('id') id: string, @Req() req) {
    // Prevent admin from deleting themselves
    const currentUserId = req.user.userId;
    if (currentUserId === Number(id)) {
      throw new Error('You cannot delete your own account');
    }
    
    await this.userService.remove(Number(id));
    return new ApiResponse(true, null, 'User deleted');
  }

  // Promote user to driver (admin only)
  @Patch(':id/promote-to-driver')
  @UseGuards(RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('user.update')
  async promoteToDriver(@Param('id') id: string, @Req() req) {
    // Prevent admin from changing their own role
    const currentUserId = req.user.userId;
    if (currentUserId === Number(id)) {
      throw new Error('You cannot change your own role');
    }
    
    const user = await this.userService.promoteToDriver(Number(id));
    return new ApiResponse(true, user, 'User promoted to driver');
  }

  // Demote driver to user (admin only)
  @Patch(':id/demote-from-driver')
  @UseGuards(RoleGuard, PermissionsGuard)
  @Roles('ADMIN')
  @RequirePermissions('user.update')
  async demoteFromDriver(@Param('id') id: string, @Req() req) {
    // Prevent admin from changing their own role
    const currentUserId = req.user.userId;
    if (currentUserId === Number(id)) {
      throw new Error('You cannot change your own role');
    }
    
    const user = await this.userService.demoteFromDriver(Number(id));
    return new ApiResponse(true, user, 'Driver demoted to user');
  }

  // Any authenticated user can get their own profile
  @Get('/me')
  async getMe(@Req() req) {
    // For demo: derive permissions from role
    const user = req.user;
    user.permissions = derivePermissionsFromRole(user.role);
    const me = await this.userService.getMe(user.userId);
    return new ApiResponse(true, me);
  }
}

// Demo: derive permissions from role
function derivePermissionsFromRole(role: string): string[] {
  if (role === 'ADMIN') return ['user.create', 'user.read', 'user.update', 'user.delete'];
  if (role === 'USER') return ['user.read', 'user.update'];
  if (role === 'DRIVER') return ['user.read'];
  return [];
}
