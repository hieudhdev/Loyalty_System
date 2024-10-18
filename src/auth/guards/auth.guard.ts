import {
    CanActivate,
    ExecutionContext,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/entities/role.entity';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private authService: AuthService,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const accessToken = this.extractTokenFromHeader(request);

        if (!accessToken) throw new UnauthorizedException();
        
        try {
            const payload = await this.verifyToken(accessToken)
            await this.attachUserRoles(request, payload)

            return true
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Access token expired');
            }
            throw new UnauthorizedException('Invalid token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    private async verifyToken(token: string): Promise<any> {
        return await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
        });
    }

    private async attachUserRoles(request: any, payload: any): Promise<void> {
        const roles = await this.roleRepository
            .createQueryBuilder('role')
            .innerJoin('role.userRoles', 'userRole')
            .innerJoin('userRole.user', 'user')
            .where('user.id = :userId', { userId: payload.id })
            .getMany();

        request['user'] = {
            ...payload,
            role: roles.map(role => role.name)
        };
    }

}