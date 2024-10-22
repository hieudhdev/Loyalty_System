import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionMockDto {
    @ApiProperty({ example: 2999 })
    @IsNotEmpty({ message: 'Amount is required' })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 9 })
    @IsNotEmpty({ message: 'UserId is required' })
    @IsNumber()
    userId: number;

    @ApiProperty({ example: 1 })
    @IsNotEmpty({ message: 'transactionTypeId is required' })
    @IsNumber()
    transactionTypeId: number
}