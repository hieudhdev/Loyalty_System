import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    first_name?: string;

    @IsNotEmpty()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;
}