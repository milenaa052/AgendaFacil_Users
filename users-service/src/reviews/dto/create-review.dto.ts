import { IsDateString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @IsNumber() @IsNotEmpty() customerId: number;
    @IsNumber() @IsNotEmpty() companyId: number;
    @IsDateString() @IsNotEmpty() date: string;
    @IsNumber() @Min(1) @Max(5) @IsNotEmpty() rating: number;
    @IsNotEmpty() comment: string;
}