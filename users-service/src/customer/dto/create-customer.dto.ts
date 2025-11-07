import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
    @IsString() name: string;
    @IsString() cpf: string;
    @IsString() phone: string;
    @IsString() state: string;
    @IsString() city: string;
    @IsString() street: string;
    @IsNumber() number: number;
    @IsOptional() @IsString() complement?: string;
    @IsEmail({}, { message: 'Email inválido' }) email: string;
    @IsString() password: string;
}
