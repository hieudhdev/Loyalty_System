import { 
    Req,
    Res,
    Param,
    Controller, 
    Get,
    UseGuards,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { User } from 'src/entities/user.entity';
import { GetTransactionsDto } from '../transaction/dto/get-transactions.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { GetPointHistoryDto } from 'src/point/dto/get-point-history.dto';
import { PointService } from 'src/point/point.service';

@Controller('admin')
export class AdminController {

    constructor(
        private readonly usersService: UsersService,
        private readonly transactionService: TransactionService,
        private readonly pointService: PointService
    ) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Get('list-user')
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getListUsers (): Promise<any> {
        return await this.usersService.getListUser()
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('user-profile/:id')
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getUserProfile (@Param('id') id: number | string): Promise<any> {
        let userId = typeof id === 'string' ? parseInt(id, 10) : id;

        return await this.usersService.getUserProfileByUserId(userId)    
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('user-transaction')
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getUserTransactions (@Query() getTransactionsDto: GetTransactionsDto): Promise<any> {
        const { userId } = getTransactionsDto

        return await this.transactionService.getTransactionByUserId(getTransactionsDto, userId)    
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('user-point-history')
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getUserPointHistory (@Query() getPointHistoryDto: GetPointHistoryDto): Promise<any> {
        const { userId } = getPointHistoryDto

        return await this.pointService.getPointHistoryByUserId(getPointHistoryDto, userId)    
    }

}
