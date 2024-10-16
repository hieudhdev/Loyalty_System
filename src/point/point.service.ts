import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyPoint } from 'src/entities/loyalty-point.entity';
import { LoyaltyPointHistory } from 'src/entities/loyalty-point-history.entity';
import { GetPointHistoryDto } from './dto/get-point-history.dto';

@Injectable()
export class PointService {

    constructor(
        @InjectRepository(LoyaltyPoint)
        private readonly pointRepository: Repository<LoyaltyPoint>,
        @InjectRepository(LoyaltyPointHistory)
        private readonly pointHistoryRepository: Repository<LoyaltyPointHistory>,
    ) {}

    async getPointByUserId(id: number): Promise<LoyaltyPoint> {
        let userPoint: any = {}
        try {
            userPoint = this.pointRepository.findOne({
                where: { user: { id }}
            });
        } catch (error) {
            console.error(error)
            throw new NotFoundException('User point not found')
        }
        
        return userPoint
    }

    async getPointHistoryByUserId(getPointHisoryDto: GetPointHistoryDto, userId: number): Promise<any> {
        const { startDate = null, endDate = null, order = "ASC" } = getPointHisoryDto

        // const query = this.pointHistoryRepository
        // .createQueryBuilder('pointHistory')
        // .innerJoinAndSelect('pointHistory.transaction', 'transaction')
        // .innerJoinAndSelect('transaction.user', 'user')
        // .where('user.id = :userId', { userId });

        const query = this.pointHistoryRepository
        .createQueryBuilder('pointHistory')
        .where(
            'pointHistory.transactionId IN ' + 
            `(SELECT transaction.id FROM "Transactions" transaction WHERE transaction."userId" = :userId)`, 
            { userId: userId }
        );

        if (startDate && endDate) {
            query.andWhere('pointHistory.created_at BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        } else if (startDate) {
            query.andWhere('pointHistory.created_at >= :startDate', { startDate });
        } else if (endDate) {
            query.andWhere('pointHistory.created_at <= :endDate', { endDate });
        }

        query.orderBy('pointHistory.created_at', order);

        return query.getMany();
    }
    
    
}
