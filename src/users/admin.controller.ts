import { 
    Req,
    Res,
    Controller, 
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/entities/user.entity';

@Controller('admin')
export class AdminController {

    constructor(
        private readonly usersService: UsersService
    ) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Get('list-user')
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getListUsers (): Promise<any> {
        return await this.usersService.getListUser()
    }
}
