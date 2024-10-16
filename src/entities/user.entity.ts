import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { UserRole } from './user-role.entity';
import { LoyaltyPoint } from './loyalty-point.entity';
import { Transaction } from './transaction.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  @OneToOne(() => LoyaltyPoint, loyaltyPoint => loyaltyPoint.user)
  loyaltyPoints: LoyaltyPoint;

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];
}