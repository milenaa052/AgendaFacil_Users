import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() cpf?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsNumber() number?: number;
  @IsOptional() @IsString() complement?: string;
  @IsOptional() @IsEmail({}, { message: 'Email inválido' }) email?: string;

  @IsOptional() @IsString() currentPassword?: string;
  @IsOptional() @IsString() newPassword?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}
