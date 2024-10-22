import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthEmailLoginDto {
    @ApiProperty({ example: 'johndoe@gmai.com' })
    @IsEmail({}, { message: 'Email is invalid'})
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}