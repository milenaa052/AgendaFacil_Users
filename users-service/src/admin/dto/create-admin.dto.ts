import { IsEmail, IsString } from 'class-validator';

export class CreateAdminDto {
    @IsString() name: string;
    @IsString() corporateReason: string;
    @IsEmail({}, { message: 'Email inválido' }) email: string;
    @IsString() password: string;
}