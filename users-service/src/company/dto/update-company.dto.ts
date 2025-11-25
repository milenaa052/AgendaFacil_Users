import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() corporateReason?: string;
  @IsOptional() @IsString() cnpj?: string;
  @IsOptional() @IsNumber() rayKm?: number;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsNumber() number?: number;
  @IsOptional() @IsString() complement?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() profession?: string;
  @IsOptional() @IsNumber() averagePrice?: number;
  @IsOptional() @IsEmail({}, { message: 'Email inválido' }) email?: string;

  @IsOptional() @IsString() currentPassword?: string;
  @IsOptional() @IsString() newPassword?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}
