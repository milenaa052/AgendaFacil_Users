import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ReviewStatus } from '../review.model';

export class UpdateReviewDto {
    @IsOptional() @IsNumber() customerId?: number;
    @IsOptional() @IsNumber() companyId?: number;
    @IsOptional() @IsDateString() date?: string;
    @IsOptional() @IsNumber() rating?: number;
    @IsOptional() @IsString() comment?: string;
    @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
}