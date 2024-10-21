import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { 
    Req,
    Res,
    ConflictException,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Request, Response } from 'express';
import { Role } from 'src/entities/role.entity';
import { LoyaltyPoint } from 'src/entities/loyalty-point.entity';
import { UserRole } from 'src/entities/user-role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpgradeAdminDto } from './dto/upgrade-admin.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) 
        private readonly userRepository: Repository<User>,
        @InjectRepository(LoyaltyPoint)
        private readonly pointRepository: Repository<LoyaltyPoint>,
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        private readonly configService: ConfigService,
    ) {}

    async findUserByEmail(email: string): Promise<User> {
        let user: User;
        try {
            user = await this.userRepository.findOneBy({ email })
        } catch (err) {
            throw new NotFoundException('User not found')
        }
        return user
    }

    async findUserById(id: number): Promise<User> {
        let user: User;

        try {
            user = await this.userRepository.findOne({ 
                where: { id },
                select: ['id', 'first_name', 'last_name', 'phone_number', 'email', 'is_active']
            })
        } catch (err) {
            throw new NotFoundException('User not found')
        }
        return user
    }

    async getRoleByUserId(userId: number): Promise<any> {
        const userRoles = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRole')
            .leftJoinAndSelect('userRole.role', 'role')
            .where('user.id = :id', { id: userId })
            .getOne();

        return userRoles
    }

    async create (createUserDto: CreateUserDto): Promise<User> {
        // check email existed?
        if (createUserDto.email) {
            const foundUser = await this.userRepository.findOneBy({email: createUserDto.email})
            if (foundUser) throw new ConflictException('Email already exists!')
        }

        // hash password
        let passwordHash: string | undefined = undefined;
        if (createUserDto.password) {
            passwordHash = await bcrypt.hash(createUserDto.password, 10);
        }
        
        // new user
        const newUser = this.userRepository.create({
            email: createUserDto.email,
            first_name: createUserDto.firstName,
            last_name: createUserDto.lastName,
            password: passwordHash,
            phone_number: createUserDto.phoneNumber || null,
            is_active: true,
        });
        const newUserSaved = await this.userRepository.save(newUser);

        // find role = user
        const foundRole = await this.roleRepository.findOne({
            where: { name: "user"}
        })
        if (!foundRole) throw new NotFoundException('Role not found')

        // create userRole (role for user)
        const newUserRole = this.userRoleRepository.create({
            user: newUser,
            role: foundRole
        }) 
        await this.userRoleRepository.save(newUserRole)

        // create point
        const newUserPoint = this.pointRepository.create({
            total_points: 0,
            user: newUser
        })
        await this.pointRepository.save(newUserPoint)

        return newUserSaved
    }

    async updateProfileByUserId (updateUserDto: UpdateUserDto, id: number): Promise<User>{
        let userUpdate: User
        try {
            userUpdate = await this.userRepository.save({
                id,
                ...updateUserDto
            })
        } catch (err) {
            console.error(err)
            throw new BadRequestException('Cannot update user profile')
        }

        return userUpdate
    }

    async getListUser (): Promise<any> {
        let listUser: any
        let listUserReshaped: any
        try {
            const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRole')
            .leftJoinAndSelect('userRole.role', 'role')
            .select([
                'user.id', 
                'user.first_name', 
                'user.email', 
                'user.last_name', 
                'user.is_active', 
                'userRole', 
                'role.name'
            ])

            listUser = await query.getMany()


            listUserReshaped = listUser.map(user => ({
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                is_active: user.is_active,
                userRoles: user.userRoles.map(userRole => ({
                    role: {
                        name: userRole.role.name
                    }
                }))
            }))
        } catch (err) {
            console.error(err)
            throw new BadRequestException('Cannot get user list')
        }

        return listUserReshaped
    }

    async getUserProfileByUserId (id: number ): Promise<any> {
        let userProfile: any

        try {
            const query = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.loyaltyPoints', 'loyaltyPoint')
            .where('user.id = :id', { id: id })
            .select([
                'user.id', 
                'user.first_name', 
                'user.email', 
                'user.last_name', 
                'user.is_active',
                'loyaltyPoint.total_points'
            ])

            userProfile = await query.getOne()
        } catch (err) {
            console.error(err)
            throw new BadRequestException('Cannot get user profile')
        }

        return userProfile
    }

    async upgradeAdmin (upgradeAdminDto: UpgradeAdminDto, @Req() req: Request): Promise<any> {
        const userId = req.user.id
        const { admin_key_secret } = upgradeAdminDto
        const ADMIN_KEY = this.configService.get<string>('ADMIN_KEY_SECRET')

        try {
            // check admin_key_secret
            if (admin_key_secret !== ADMIN_KEY) throw new BadRequestException('admin_key_secret incorrect')

            // find user 
            const foundUser = await this.findUserById(userId)
            if (!foundUser) throw new NotFoundException('User not found')

            // find role = user
            const foundRole = await this.roleRepository.findOne({
                where: { name: "admin"}
            })
            if (!foundRole) throw new NotFoundException('Role not found')
            
            // find user role
            const foundUserRole = await this.userRoleRepository.findOne({
                where: { 
                    user: { id: foundUser.id }, 
                    role: { id: foundRole.id }
                }
            })
            if (foundUserRole) throw new BadRequestException('User already a admin')
            
            const newUserRole = this.userRoleRepository.create({
                user: foundUser,
                role: foundRole
            }) 
            await this.userRoleRepository.save(newUserRole)

        } catch (err) {
            console.error(err)
            throw new BadRequestException('Upgrade admin fail')
        }
    }

}
