import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John1'})
    @IsNotEmpty()
    @IsString()
    first_name?: string;

    @ApiPropertyOptional({ example: 'Doe1'})
    @IsNotEmpty()
    @IsString()
    last_name?: string;

    @ApiPropertyOptional({ example: '0123456788'})
    @IsOptional()
    @IsString()
    phone_number?: string;
}