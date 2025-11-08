import { IsNumber } from 'class-validator';

export class CreateFavoritesDto {
    @IsNumber() customerId: number;
    @IsNumber() companyId: number;
}