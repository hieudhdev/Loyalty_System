import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpgradeAdminDto {
    @ApiProperty({ example: 'abc123xxx' })
    @IsNotEmpty({ message: 'ADMIN_KEY_SECRET is required' })
    @IsString()
    admin_key_secret: string;
}