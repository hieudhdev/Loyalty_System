import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionType } from 'src/entities/transaction-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionType])
  ],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: [TransactionService]
})
export class TransactionModule {}
