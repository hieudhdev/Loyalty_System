import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateTransactionMockDto {
    @IsNotEmpty({ message: 'Amount is required' })
    @IsNumber()
    amount: number;

    @IsNotEmpty({ message: 'UserId is required' })
    @IsNumber()
    userId: number;

    @IsNotEmpty({ message: 'transactionTypeId is required' })
    @IsNumber()
    transactionTypeId: number
}