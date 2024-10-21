import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import {
    Req,
    Res,
    Injectable, 
    NotFoundException, 
    UnauthorizedException,
    BadRequestException
} from '@nestjs/common';
import { User } from '../entities/user.entity'

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    private async genTokensPair (user: User) {
        const payload = { email: user.email, id: user.id };

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

    async genAccessTokenByRefreshToken (@Req() req: Request): Promise<{ accessToken: string }> {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found, please login again');
        }

        let payload: any;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Login session has expired. Please login again');
            }
            throw new UnauthorizedException('Invalid refresh token. Please login again.');
        }

        const userExists = await this.usersService.findUserById(payload.id);

        if (!userExists) {
            throw new BadRequestException('User no longer exists');
        }

        const accessToken = await this.jwtService.signAsync(
            { email: userExists.email, id: userExists.id }, 
            {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '30m',
            },
        );

        return { accessToken }; 
    }

    async emailRegister (registerDto: AuthEmailRegisterDto): Promise<void> {
        const user = await this.usersService.create({
            ...registerDto,
        })
    }
    
    async emailLogin (loginDto: AuthEmailLoginDto, @Res() res: Response): Promise<LoginResponseDto> {
        const foundUser = await this.usersService.findUserByEmail(loginDto.email)
        if (!foundUser) throw new NotFoundException('Email not registered')

        const isValidPassword = await bcrypt.compare(loginDto.password, foundUser.password)
        if (!isValidPassword) throw new UnauthorizedException('Invalid credentials')

        const tokenPair = await this.genTokensPair(foundUser)

        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokenPair.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        // hide password
        foundUser.password = ''

        return {
            user: {
                id: foundUser.id,
                first_name: foundUser.first_name,
                last_name: foundUser.last_name,
                email: foundUser.email,
                phone_number: foundUser.phone_number,
                is_active: foundUser.is_active
            },
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
        }
    }

    async logout (@Res({ passthrough: true }) res: Response): Promise<any> {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
            });

            return { message: 'Logout successfull'}
        } catch (err) {
            console.error(err);
            throw new BadRequestException('Logout failed');
        }
    }

}
