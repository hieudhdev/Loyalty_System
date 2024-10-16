import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { TransactionType } from './transaction-type.entity';
import { LoyaltyPointHistory } from './loyalty-point-history.entity';

@Entity('Transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.transactions)
  user: User;

  @ManyToOne(() => TransactionType, transactionType => transactionType.transactions)
  transactionType: TransactionType;

  @OneToOne(() => LoyaltyPointHistory, loyaltyPointHistory => loyaltyPointHistory.transaction)
  loyaltyPointHistory: LoyaltyPointHistory;
}