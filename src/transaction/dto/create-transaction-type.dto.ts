import { IsNotEmpty, MinLength, IsString, IsOptional, IsNumber } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionTypeDto {
    @ApiProperty({ example: 'Buy item' })
    @IsNotEmpty({ message: 'transasction name is required'})
    name: string;

    @ApiPropertyOptional({ example: 'Customer buy items' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 0.3 })
    @IsNumber()
    @IsNotEmpty({ message: 'Point ratio is required' })
    points_ratio: number;

    @ApiProperty({ example: 'BuyItem' })
    @IsNotEmpty({ message: 'transaction type is required' })
    @IsString()
    type: string;

    @ApiProperty({ example: 1000 })
    @IsNotEmpty({ message: 'Min amount is required' })
    @IsNumber()
    min_amount: number;
}