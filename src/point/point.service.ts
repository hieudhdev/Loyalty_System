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
import { Cron, CronExpression } from '@nestjs/schedule';

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

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handlePointHistory (): Promise<any> {
        const unprocessedPointHistory = await this.pointHistoryRepository
        .createQueryBuilder('pointHistory')
        .leftJoinAndSelect('pointHistory.transaction', 'transaction')
        .leftJoinAndSelect('transaction.user', 'user')
        .select([
            'pointHistory.id',
            'pointHistory.points_change_type',
            'pointHistory.points',
            'pointHistory.point_status',
            'transaction',
            'user'
        ])
        .where('pointHistory.point_status = :status', { status: false })
        .getMany()

        for (const pointHistory of unprocessedPointHistory) {
            await this.processPointHistory(pointHistory);
        }
    }

    async processPointHistory (pointHistory: any): Promise<void> {
        const { points_change_type, points, point_status } = pointHistory
        const userId = pointHistory.transaction.user.id

        // handle plus or substract points
        let pointsProcessed: number = 0
        if (!points_change_type) pointsProcessed = points * -1
        else pointsProcessed = points

        // update user point
        await this.pointRepository
        .createQueryBuilder()
        .update(LoyaltyPoint)
        .set({ total_points: () => `total_points + ${pointsProcessed}` })
        .where('userId = :userId', { userId: userId })
        .execute()

        // update pointHistory.point_status
        await this.pointHistoryRepository
        .createQueryBuilder()
        .update(LoyaltyPointHistory)
        .set({ point_status: true })
        .where('id = :id', { id: pointHistory.id })
        .execute()
    }

}
