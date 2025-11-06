import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFavoritesDto {
    @IsNumber() @IsNotEmpty() customerId: number;
    @IsNumber() @IsNotEmpty() companyId: number;
}