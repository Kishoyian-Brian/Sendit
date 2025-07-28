import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateParcelStatusDto {
  @IsString()
  @IsIn(['pending', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 