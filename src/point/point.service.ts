import { 
    Injectable, 
    NotFoundException, 
    Query,
    BadRequestException
} from '@nestjs/common';
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

    async getPointHistoryByUserId(getPointHistoryDto: GetPointHistoryDto, userId: number): Promise<any> {
        const { startDate = null, endDate = null, order = "ASC" } = getPointHistoryDto
        let points: any;

        try {
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
    
            points = query.orderBy('pointHistory.created_at', order).getMany()

        } catch (error) {
            console.error(error)
            throw new BadRequestException('Cannot get user points history')
        }


        return points
    }
    
    async getPointHistorySystem (getPointHistoryDto: GetPointHistoryDto): Promise<any> {
        const { startDate = null, endDate = null, order = "ASC" } = getPointHistoryDto
        let points: any

        try {
            const query = this.pointHistoryRepository
            .createQueryBuilder('pointHistory')
            .leftJoinAndSelect('pointHistory.transaction', 'transaction')
            .leftJoinAndSelect('transaction.user', 'user')

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
    
            points = await query.orderBy('pointHistory.created_at', order)
            .select([
                'pointHistory.id',
                'pointHistory.points_change_type',
                'pointHistory.points',
                'pointHistory.description',
                'pointHistory.created_at',
                'transaction.id',
                'user.id',
                'user.first_name',
                'user.last_name',
            ])
            .getMany()

        } catch (error) {
            console.error(error)
            throw new BadRequestException('Cannot get transactions system')
        }

        return points
    }

}
