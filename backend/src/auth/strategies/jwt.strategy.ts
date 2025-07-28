import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: AuthPayload) {
    // Derive permissions from role
    const permissions = this.derivePermissionsFromRole(payload.role);
    
    return { 
      userId: payload.userId, 
      email: payload.email, 
      role: payload.role,
      permissions 
    };
  }

  private derivePermissionsFromRole(role: string): string[] {
    if (role === 'ADMIN') return ['user.create', 'user.read', 'user.update', 'user.delete', 'parcel.create', 'parcel.read', 'parcel.update', 'parcel.delete', 'driver.create', 'driver.read', 'driver.update', 'driver.delete'];
    if (role === 'USER') return ['user.read', 'user.update', 'parcel.read'];
    if (role === 'DRIVER') return ['user.read', 'parcel.read', 'parcel.update'];
    return [];
  }
}
