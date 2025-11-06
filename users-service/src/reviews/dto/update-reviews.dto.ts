import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ReviewStatus } from '../review.model';

export class UpdateReviewDto {
    @IsOptional() @IsNumber() customerId?: number;
    @IsOptional() @IsNumber() companyId?: number;
    @IsOptional() @IsDateString() date?: string;
    @IsOptional() @Min(1) @Max(5) @IsNumber() rating?: number;
    @IsOptional() @IsString() comment?: string;
    @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
}