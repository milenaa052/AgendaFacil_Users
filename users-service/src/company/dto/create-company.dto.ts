import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCompanyDto {
    @IsNotEmpty() name: string;
    @IsString() @IsNotEmpty() corporateReason: string;
    @IsString() @IsNotEmpty() cnpj: string;
    @IsNumber() @Min(1) @IsNotEmpty() rayKm: number;
    @IsNotEmpty() phone: string;
    @IsNotEmpty() state: string;
    @IsNotEmpty() city: string;
    @IsNotEmpty() street: string;
    @IsNumber() number: number;
    @IsOptional() @IsString() complement?: string;
    @IsString() @IsNotEmpty() category: string;
    @IsString() @IsNotEmpty() profession: string;
    @IsEmail() email: string;
    @IsNotEmpty() password: string;
}