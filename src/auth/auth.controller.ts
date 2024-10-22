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
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly service: AuthService) {}

    @Post('refresh-token')
    @ApiOperation({
        summary: 'Refresh access token when expired'
    })
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req: Request): Promise<{ accessToken: string }> {

        return await this.service.genAccessTokenByRefreshToken(req)
    }

    @Post('email/register')
    @ApiOperation({
        summary: 'Register account by email'
    })
    @ApiBody({
        type: AuthEmailRegisterDto,
        examples: {
            user_1: {
                value: {
                    email: 'johndoe@gmail.com',
                    password: '123456',
                    firstName: 'John',
                    lastName: 'Doe',
                    phoneNumber: '0123456789'
                } as AuthEmailRegisterDto
            }
        }

    })
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: AuthEmailRegisterDto): Promise<any> {
        return await this.service.emailRegister(registerDto)
    }

    @Post('email/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login by email account'
    })
    @ApiBody({
        type: AuthEmailLoginDto,
        examples: {
            user_1: {
                value: {
                    email: 'johndoe@gmail.com',
                    password: '123456',
                } as AuthEmailLoginDto
            }
        }
    })
    public async login(@Body() loginDto: AuthEmailLoginDto, @Res({passthrough: true}) res: Response): Promise<LoginResponseDto> {
        return await this.service.emailLogin(loginDto, res)
    }

    @UseGuards(AuthGuard)
    @Post('logout')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Logout'
    })
    @HttpCode(HttpStatus.OK)
    async logout (@Res({passthrough: true}) res: Response) {
        return await this.service.logout(res)
    }

}
