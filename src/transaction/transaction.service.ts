import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { Repository } from 'typeorm';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { TransactionType } from 'src/entities/transaction-type.entity';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto'
import { UsersService } from 'src/users/users.service';
import { CreateTransactionMockDto } from './dto/create-transaction-mock.dto'
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoyaltyPointHistory } from 'src/entities/loyalty-point-history.entity';

@Injectable()
export class TransactionService {

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(TransactionType)
        private readonly transactionTypeRepository: Repository<TransactionType>,
        @InjectRepository(LoyaltyPointHistory)
        private readonly pointHistoryRepository: Repository<LoyaltyPointHistory>,
        private readonly usersService: UsersService
    ) {}

    async getTransactionByUserId (getTransactionsDto: GetTransactionsDto, id: number): Promise<any> {
        const { startDate = null, endDate = null, order = "DESC" } = getTransactionsDto
        let transactions: any

        try {
            const query = await this.transactionRepository
            .createQueryBuilder('transaction')
            .innerJoinAndSelect('transaction.transactionType', 'transactionType')
            .where('transaction.userId = :userId', { userId: id })
    
            if (startDate && endDate) {
                query.andWhere('transaction.created_at BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                });
            } else if (startDate) {
                query.andWhere('transaction.created_at >= :startDate', { startDate });
            } else if (endDate) {
                query.andWhere('transaction.created_at <= :endDate', { endDate });
            }
    
            transactions = query.orderBy('transaction.created_at', order)
            .select([
                'transaction.id',
                'transaction.amount',
                'transaction.created_at',
                'transactionType.name', 
                'transactionType.description', 
                'transactionType.type', 
                'transactionType.points_ratio',
            ])
            .getMany()

        } catch (error) {
            console.error(error)
            throw new BadRequestException('Cannot get transactions by userId')
        }

        return transactions
    }

    async getTransactionSystem (getTransactionsDto: GetTransactionsDto): Promise<any> {
        const { startDate = null, endDate = null, order = "DESC" } = getTransactionsDto
        let transactions: any

        try {
            const query = this.transactionRepository
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.user', 'user')
            .leftJoinAndSelect('transaction.transactionType', 'transactionType')

            if (startDate && endDate) {
                query.andWhere('transaction.created_at BETWEEN :startDate AND :endDate', {
                    startDate,
                    endDate,
                });
            } else if (startDate) {
                query.andWhere('transaction.created_at >= :startDate', { startDate });
            } else if (endDate) {
                query.andWhere('transaction.created_at <= :endDate', { endDate });
            }

            transactions = await query.orderBy('transaction.created_at', order)
            .select([
                'user.first_name', 
                'user.last_name',
                'transaction.id', 
                'transaction.amount', 
                'transaction.created_at',
                'transactionType.name',
                'transactionType.description'
            ])
            .getMany()
        } catch (error) {
            console.error(error)
            throw new BadRequestException('Cannot get transactions system')
        }

        return transactions
    }

    async createTransactionType (createTransactionTypeDto: CreateTransactionTypeDto): Promise<any>{
        let newTransactionType: any

        try {
            const transactionType = this.transactionTypeRepository.create({
                ...createTransactionTypeDto
            })

            newTransactionType = await this.transactionTypeRepository.save(transactionType)
            
        } catch (error) {
            console.error(error)
            throw new BadRequestException('Cannot create transaction type')
        }

        return newTransactionType
    }

    async createTransactionMock (createTransactionMockDto: CreateTransactionMockDto): Promise<any> {
        const { userId, transactionTypeId, amount } = createTransactionMockDto
        
        try {
            const foundUser = await this.usersService.findUserById(userId)
            if (!foundUser) throw new BadRequestException('User not found')

            const foundTransactionType = await this.transactionTypeRepository.findOne({
                where: { id: transactionTypeId }
            })    
            if (!foundTransactionType) throw new BadRequestException('Transaction type not found')

            const newTransaction = this.transactionRepository.create({
                amount: amount,
                user: foundUser,
                transactionType: foundTransactionType
            })
            const newTransactionSaved = await this.transactionRepository.save(newTransaction)

            return newTransactionSaved
        } catch (error) {
            console.error(error)
            throw new BadRequestException('Cannot create transaction (mock)')
        }
    }

    // Cronjob transaction -> point history
    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleTransactions (): Promise<void> {
        const unprocessedTransactions = await this.transactionRepository
        .createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.transactionType', 'transactionType')
        .select([
            'transaction.id',
            'transaction.amount',
            'transaction.point_status',
            'transactionType.min_amount',
            'transactionType.points_ratio',
            'transactionType.description'
        ])
        .where('transaction.point_status = :status', { status: false })
        .getMany()

        for (const transaction of unprocessedTransactions) {
            await this.processTransaction(transaction);
        }
    }

    async processTransaction (transaction: any): Promise<void> {
        const { amount, point_status, transactionType } = transaction
        const { min_amount, points_ratio, description } = transactionType
        const points_ratio_float = parseFloat(points_ratio)

        // check min_amount
        if (amount >= min_amount && !point_status) {
            // calculator point
            const bonusPoint = Math.round(amount * points_ratio_float)

            // save point history
            const newPointHistory = this.pointHistoryRepository.create({
                points_change_type: 1,
                points: bonusPoint,
                description: description,
                transaction: transaction
            })
            await this.pointHistoryRepository.save(newPointHistory)

            // update transaction.point_status = true
            await this.transactionRepository
            .createQueryBuilder()
            .update(Transaction)
            .set({ point_status: true })
            .where('id = :id', { id: transaction.id })
            .execute()

        } else {
            // update transaction.point_status = true
            await this.transactionRepository
            .createQueryBuilder()
            .update(Transaction)
            .set({ point_status: true })
            .where('id = :id', { id: transaction.id })
            .execute()
        }

    }
}
