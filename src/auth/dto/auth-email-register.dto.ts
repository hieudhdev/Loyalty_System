import { IsEmail, IsNotEmpty, MinLength, IsString } from "class-validator";

export class AuthEmailRegisterDto {
    @IsEmail({}, { message: 'Email is invalid'})
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsNotEmpty({ message: 'first name is required'})
    firstName: string;

    @IsNotEmpty({ message: 'last name is required'})
    lastName: string;

    @IsString()
    phoneNumber: string;
}