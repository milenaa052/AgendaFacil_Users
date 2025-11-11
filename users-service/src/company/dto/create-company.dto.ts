import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
    @IsString() name: string;
    @IsString() corporateReason: string;
    @IsString() cnpj: string;
    @IsNumber() rayKm: number;
    @IsString() phone: string;
    @IsString() state: string;
    @IsString() city: string;
    @IsString() street: string;
    @IsNumber() number: number;
    @IsOptional() @IsString() complement?: string;
    @IsString() category: string;
    @IsString() profession: string;
    @IsNumber() averagePrice: number;
    @IsEmail({}, { message: 'Email inválido' }) email: string;
    @IsString() password: string;
}