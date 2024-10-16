import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { Repository } from 'typeorm';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@Injectable()
export class TransactionService {

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>
    ) {}

    async getTransactionByUserId (getTransactionsDto: GetTransactionsDto, id: number): Promise<any> {
        const { startDate = null, endDate = null, order = "DESC" } = getTransactionsDto

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

        const transactions = query.orderBy('transaction.created_at', order)
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

        return transactions
    }

}
