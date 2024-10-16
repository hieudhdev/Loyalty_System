import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('PointsHistory')
export class LoyaltyPointHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: [0, 1],
  })
  points_change_type: number;

  @Column()
  points: number;

  @Column()
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Transaction, transaction => transaction.loyaltyPointHistory)
  @JoinColumn()
  transaction: Transaction;
}