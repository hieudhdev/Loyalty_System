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

@Controller('user')
export class UsersController {

    constructor(
        private userService: UsersService,
        private pointService: PointService,
        private transactionService: TransactionService
    ) {}

    @UseGuards(AuthGuard, RolesGuard)
    @Get('profile')
    @Roles(Role.User, Role.Admin)
    @HttpCode(HttpStatus.FOUND)
    async getProfileById (@Req() req: Request): Promise<User> {
        let userId = req.user.id;

        return await this.userService.findUserById(userId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post('update-profile')
    @Roles(Role.User, Role.Admin)
    @HttpCode(HttpStatus.OK)
    async updateProfileById (@Body() updateUserDto: UpdateUserDto, @Req() req: Request): Promise<User> {
        let userId = req.user.id;

        return await this.userService.updateProfileByUserId(updateUserDto, userId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('point')
    @Roles(Role.User)
    @HttpCode(HttpStatus.FOUND)
    async getPointById (@Req() req: Request): Promise<LoyaltyPoint> {
        let userId = req.user.id;

        return await this.pointService.getPointByUserId(userId)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('point-history')
    @Roles(Role.User)
    @HttpCode(HttpStatus.FOUND)
    async getPointHistoryById (@Query() getPointHisoryDto: GetPointHistoryDto, @Req() req: Request): Promise<LoyaltyPoint> {
        let userId = req.user.id;

        return await this.pointService.getPointHistoryByUserId(getPointHisoryDto, userId)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('transaction')
    @Roles(Role.User)
    @HttpCode(HttpStatus.FOUND)
    async getTransactionById (@Query() getTransactionsDto: GetTransactionsDto, @Req() req: Request): Promise<any> {
        let userId = req.user.id;

        return await this.transactionService.getTransactionByUserId(getTransactionsDto, userId)
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Post('upgrade-admin')
    @Roles(Role.User)
    @HttpCode(HttpStatus.OK)
    async upgradeAdminAccount (@Body() upgradeAdminDto: UpgradeAdminDto, @Req() req: Request): Promise<any> {
        return await this.userService.upgradeAdmin(upgradeAdminDto, req)
    }

}
