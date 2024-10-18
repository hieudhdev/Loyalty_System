import { 
    Req,
    Res,
    Controller,
    Body,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthEmailRegisterDto } from './dto/auth-email-register.dto'
import { LoginResponseDto } from './dto/login-response.dto';
import { Response, Request } from 'express';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly service: AuthService) {}

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req: Request): Promise<{ accessToken: string }> {

        return await this.service.genAccessTokenByRefreshToken(req)
    }

    @Post('email/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: AuthEmailRegisterDto): Promise<void> {
        return await this.service.emailRegister(registerDto)
    }

    @Post('email/login')
    @HttpCode(HttpStatus.OK)
    public async login(@Body() loginDto: AuthEmailLoginDto, @Res({passthrough: true}) res: Response): Promise<LoginResponseDto> {
        return await this.service.emailLogin(loginDto, res)
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout (@Res({passthrough: true}) res: Response) {
        return await this.service.logout(res)
    }

}
