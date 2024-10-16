import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToOne,
  JoinColumn
 } from 'typeorm';
import { User } from './user.entity';

@Entity('Point')
export class LoyaltyPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total_points: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, user => user.loyaltyPoints)
  @JoinColumn()
  user: User;
}