import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionType } from 'src/entities/transaction-type.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';
import { LoyaltyPoint } from 'src/entities/loyalty-point.entity';
import { UserRole } from 'src/entities/user-role.entity';
import { Role } from 'src/entities/role.entity';
import { LoyaltyPointHistory } from 'src/entities/loyalty-point-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction, 
      TransactionType, 
      User, 
      LoyaltyPoint, 
      UserRole, 
      Role,
      LoyaltyPointHistory
    ]),
  ],
  providers: [TransactionService, UsersService],
  controllers: [TransactionController],
  exports: [TransactionService]
})
export class TransactionModule {}
