import { IsDate, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTransactionsDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    userId?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    @IsString()
    order?: 'ASC' | 'DESC';
}