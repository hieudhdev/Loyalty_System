import { 
    Res,
    Req,
    Controller,
    Body,
    Post,
    Param,
    Get,
    HttpCode,
    HttpStatus,
    UseGuards,
    Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Request, Response } from 'express';
import { User } from 'src/entities/user.entity';
import { Roles } from 'src/auth/roles/role.decorator';
import { Role } from 'src/auth/roles/role.enum';
import { RolesGuard } from 'src/auth/roles/role.guard';
import { PointService } from 'src/point/point.service';
import { LoyaltyPoint } from 'src/entities/loyalty-point.entity';
import { GetPointHistoryDto } from 'src/point/dto/get-point-history.dto';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { GetTransactionsDto } from 'src/transaction/dto/get-transactions.dto'
import { UpdateUserDto } from './dto/update-user.dto';
import { UpgradeAdminDto } from './dto/upgrade-admin.dto'
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UsersController {

    constructor(
        private userService: UsersService,
        private pointService: PointService,
        private transactionService: TransactionService
    ) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Get('profile')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get user\'s profile'
    })
    @Roles(Role.User, Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getProfileById (@Req() req: Request): Promise<User> {
        let userId = req.user.id;

        return await this.userService.findUserById(userId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post('update-profile')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Update user\'s profile'
    })
    @ApiBody({
        type: UpdateUserDto,
        examples: {
            user_1: {
                value: {
                    first_name: 'john1',
                    last_name: 'doe1',
                    phone_number: '0123456789'
                } as UpdateUserDto
            }
        }
    })
    @Roles(Role.User, Role.Admin)
    @HttpCode(HttpStatus.OK)
    async updateProfileById (@Body() updateUserDto: UpdateUserDto, @Req() req: Request): Promise<User> {
        let userId = req.user.id;

        return await this.userService.updateProfileByUserId(updateUserDto, userId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('point')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get user\'s total points'
    })
    @Roles(Role.User)
    @HttpCode(HttpStatus.FOUND)
    async getPointById (@Req() req: Request): Promise<LoyaltyPoint> {
        let userId = req.user.id;

        return await this.pointService.getPointByUserId(userId)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('point-history')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get user point history'
    })
    @ApiQuery({ name: 'startDate', type: Date, example: '2024-10-01' })
    @ApiQuery({ name: 'endDate', type: Date, example: '2024-10-31' })
    @ApiQuery({ name: 'order', type: String, example: 'DESC' })
    @Roles(Role.User)
    @HttpCode(HttpStatus.FOUND)
    async getPointHistoryById (@Query() getPointHisoryDto: GetPointHistoryDto, @Req() req: Request): Promise<LoyaltyPoint> {
        let userId = req.user.id;

        return await this.pointService.getPointHistoryByUserId(getPointHisoryDto, userId)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('transaction')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Get user transaction'
    })
    @ApiQuery({ name: 'startDate', type: Date, example: '2024-10-01' })
    @ApiQuery({ name: 'endDate', type: Date, example: '2024-10-31' })
    @ApiQuery({ name: 'order', type: String, example: 'DESC' })
    @Roles(Role.User)
    @HttpCode(HttpStatus.FOUND)
    async getTransactionById (@Query() getTransactionsDto: GetTransactionsDto, @Req() req: Request): Promise<any> {
        let userId = req.user.id;

        return await this.transactionService.getTransactionByUserId(getTransactionsDto, userId)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post('upgrade-admin')
    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary: 'Upgrade user to admin (required admin_key_secret)'
    })
    @ApiBody({
        type: UpgradeAdminDto,
        examples: {
            user_1: {
                value: {
                   admin_key_secret: 'abc123xxx'
                } as UpgradeAdminDto
            }
        }
    })
    @Roles(Role.User)
    @HttpCode(HttpStatus.OK)
    async upgradeAdminAccount (@Body() upgradeAdminDto: UpgradeAdminDto, @Req() req: Request): Promise<any> {
        return await this.userService.upgradeAdmin(upgradeAdminDto, req)
    }

}
