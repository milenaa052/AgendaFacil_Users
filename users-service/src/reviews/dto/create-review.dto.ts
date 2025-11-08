import { IsDateString, IsString, IsNumber } from 'class-validator';

export class CreateReviewDto {
    @IsNumber() customerId: number;
    @IsNumber() companyId: number;
    @IsDateString() date: string;
    @IsNumber() rating: number;
    @IsString() comment: string;
}