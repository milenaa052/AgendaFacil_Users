import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserType } from '../customer.model';

export class CreateCustomerDto {
    @IsNotEmpty() name: string;
    @IsNotEmpty() cpf: string;
    @IsNotEmpty() phone: string;
    @IsNotEmpty() state: string;
    @IsNotEmpty() city: string;
    @IsNotEmpty() street: string;
    @IsNumber() number: number;
    @IsOptional() @IsString() complement?: string;
    @IsEmail() email: string;
    @IsNotEmpty() password: string;
    @IsEnum(UserType) @IsNotEmpty() type: UserType;
}
