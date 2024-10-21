import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpgradeAdminDto {
    @IsNotEmpty({ message: 'ADMIN_KEY_SECRET is required' })
    @IsString()
    admin_key_secret: string;
}