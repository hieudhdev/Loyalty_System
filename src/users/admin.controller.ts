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
    Body,
    Post,
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
import { CreateTransactionTypeDto } from '../transaction/dto/create-transaction-type.dto';
import { CreateTransactionMockDto } from 'src/transaction/dto/create-transaction-mock.dto';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {

    constructor(
        private readonly usersService: UsersService,
        private readonly transactionService: TransactionService,
        private readonly pointService: PointService
    ) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Get('list-user')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'get list all user'
    })
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getListUsers (): Promise<any> {
        return await this.usersService.getListUser()
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('user-profile/:id')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get specific user profile'
    })
    @ApiParam({ name: 'id', type: String, example: 8})
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getUserProfile (@Param('id') id: number | string): Promise<any> {
        let userId = typeof id === 'string' ? parseInt(id, 10) : id;

        return await this.usersService.getUserProfileByUserId(userId)    
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('user-transaction')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get specific user transaction'
    })
    @ApiQuery({ name: 'userId', type: Number, example: '9' })
    @ApiQuery({ name: 'startDate', type: Date, example: '2024-10-01' })
    @ApiQuery({ name: 'endDate', type: Date, example: '2024-10-31' })
    @ApiQuery({ name: 'order', type: String, example: 'DESC' })
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getUserTransactions (@Query() getTransactionsDto: GetTransactionsDto): Promise<any> {
        const { userId } = getTransactionsDto

        return await this.transactionService.getTransactionByUserId(getTransactionsDto, userId)    
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('user-point-history')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get specific user point history'
    })
    @ApiQuery({ name: 'userId', type: Number, example: '9' })
    @ApiQuery({ name: 'startDate', type: Date, example: '2024-10-01' })
    @ApiQuery({ name: 'endDate', type: Date, example: '2024-10-31' })
    @ApiQuery({ name: 'order', type: String, example: 'DESC' })
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getUserPointHistory (@Query() getPointHistoryDto: GetPointHistoryDto): Promise<any> {
        const { userId } = getPointHistoryDto

        return await this.pointService.getPointHistoryByUserId(getPointHistoryDto, userId)    
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('transaction-system')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get transactions of whole system'
    })
    @ApiQuery({ name: 'startDate', type: Date, example: '2024-10-01' })
    @ApiQuery({ name: 'endDate', type: Date, example: '2024-10-31' })
    @ApiQuery({ name: 'order', type: String, example: 'DESC' })
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getTransactionSystem (@Query() getTransactionDto: GetTransactionsDto): Promise<any> {

        return await this.transactionService.getTransactionSystem(getTransactionDto)    
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('point-system')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get point histories of whole system'
    })
    @ApiQuery({ name: 'startDate', type: Date, example: '2024-10-01' })
    @ApiQuery({ name: 'endDate', type: Date, example: '2024-10-31' })
    @ApiQuery({ name: 'order', type: String, example: 'DESC' })
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getPointHistorySystem (@Query() getPointHistoryDto: GetPointHistoryDto): Promise<any> {

        return await this.pointService.getPointHistorySystem(getPointHistoryDto)    
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post('create-transaction-type')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Create new transaction type (point rules)'
    })
    @ApiBody({
        type: CreateTransactionTypeDto,
        examples: {
            transaction_type_1: {
                value: {
                    name: 'buy item',
                    description: 'customer buy item',
                    points_ratio: 0.3,
                    type: 'BuyItem',
                    min_amount: 1000
                } as CreateTransactionTypeDto
            }
        }
    })
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async createTransactionType (@Body() createTransactionTypeDto: CreateTransactionTypeDto): Promise<any> {

        return await this.transactionService.createTransactionType(createTransactionTypeDto)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post('create-transaction-mock')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Mock create transaction for testing'
    })
    @ApiBody({
        type: CreateTransactionMockDto,
        examples: {
            transaction_1: {
                value: {
                    amount: 1999,
                    userId: 9,
                    transactionTypeId: 1
                } as CreateTransactionMockDto
            }
        }
    })
    @Roles(Role.Admin)
    @HttpCode(HttpStatus.CREATED)
    async createTransactionMock (@Body() createTransactionMockDto: CreateTransactionMockDto): Promise<any> {

        return await this.transactionService.createTransactionMock(createTransactionMockDto)
    }

}
