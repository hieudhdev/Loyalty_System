import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPointHistoryDto {
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