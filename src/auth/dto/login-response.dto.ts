import { User } from "../../entities/user.entity";

export class LoginResponseDto {
    user: {
        id: number,
        first_name: string,
        last_name: string,
        email: string,
        phone_number: string,
        is_active: boolean
    };

    accessToken: string;

    refreshToken: string;
}