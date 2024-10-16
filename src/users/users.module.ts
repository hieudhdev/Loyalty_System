import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { LoyaltyPoint } from 'src/entities/loyalty-point.entity';
import { UserRole } from 'src/entities/user-role.entity';
import { Role } from 'src/entities/role.entity';
import { PointModule } from 'src/point/point.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LoyaltyPoint, UserRole, Role]),
    PointModule,
    TransactionModule
  ],
  providers: [UsersService, JwtService, AuthService],
  controllers: [UsersController, AdminController],
  exports: [UsersService]
})

export class UsersModule {}
