import { IsEmail, IsNotEmpty, MinLength, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthEmailRegisterDto {
    @ApiProperty({ example: 'johndoe@gmai.com' })
    @IsEmail({}, { message: 'Email is invalid'})
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiProperty({ example: 'John' })
    @IsNotEmpty({ message: 'first name is required'})
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    @IsNotEmpty({ message: 'last name is required'})
    lastName: string;

    @ApiPropertyOptional({ example: '0123456789' })
    @IsString()
    phoneNumber?: string;
}