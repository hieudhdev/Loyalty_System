import { Module } from '@nestjs/common';
import { PointService } from './point.service';
import { PointController } from './point.controller';
import { LoyaltyPoint } from 'src/entities/loyalty-point.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyPointHistory } from 'src/entities/loyalty-point-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyPoint, LoyaltyPointHistory]),
  ],
  providers: [PointService],
  controllers: [PointController],
  exports: [PointService]
})
export class PointModule {}
