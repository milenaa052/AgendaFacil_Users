import { IsString, IsNumber } from 'class-validator';

export class CreateReviewDto {
    @IsNumber() customerId: number;
    @IsNumber() companyId: number;
    @IsString() date: string;
    @IsNumber() rating: number;
    @IsString() comment: string;
}