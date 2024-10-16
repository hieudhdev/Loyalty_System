import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    UsersModule, 
  ],
  providers: [
    AuthService, 
    JwtService,
  ],
  controllers: [AuthController],
  exports: []
})
export class AuthModule {}
