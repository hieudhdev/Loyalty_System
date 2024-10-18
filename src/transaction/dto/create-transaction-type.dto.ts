import { IsNotEmpty, MinLength, IsString, IsOptional, IsNumber } from "class-validator";

export class CreateTransactionTypeDto {
    @IsNotEmpty({ message: 'transasction name is required'})
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Point ratio is required' })
    points_ratio: number;

    @IsNotEmpty({ message: 'transaction type is required' })
    @IsString()
    type: string;

    @IsNotEmpty({ message: 'Min amount is required' })
    @IsNumber()
    min_amount: number;
}