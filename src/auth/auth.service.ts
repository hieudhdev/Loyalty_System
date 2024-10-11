import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserRepository } from 'src/users/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { 
    Res,
    Injectable, 
    NotFoundException, 
    UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private usersRepository: UserRepository,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    private async genTokensPair (user: User) {
        const payload = { email: user.email, userId: user.id };

        const accessToken = await this.jwtService.signAsync(
            { ...payload },
            {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '1h',
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            { ...payload }, 
            {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: '3d',
            }
        );

        return { accessToken, refreshToken };
    }

    async emailRegister (registerDto: AuthEmailRegisterDto): Promise<void> {
        const user = await this.usersService.create({
            ...registerDto,
        })
    }
    
    async emailLogin (loginDto: AuthEmailLoginDto, @Res() res: Response): Promise<LoginResponseDto> {
        const foundUser = await this.usersRepository.findUserByEmail(loginDto.email)
        if (!foundUser) throw new NotFoundException('Email not registered')

        const isValidPassword = await bcrypt.compare(loginDto.password, foundUser.password)
        if (!isValidPassword) throw new UnauthorizedException('Invalid credentials')

        const tokenPair = await this.genTokensPair(foundUser)

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokenPair.refreshToken, {
            httpOnly: true,
            // secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        return {
            user: foundUser,
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
        }
    }

}
