import { Body, Controller, Get, Param, Post, Put, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-reviews.dto';
import { AuthGuard } from '@nestjs/passport';
import type { AuthRequest } from '../auth/types/auth-request.interface';

@Controller('reviews')
export class ReviewController {
    constructor( private readonly reviewService: ReviewService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewService.create(createReviewDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.reviewService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.reviewService.findById(id);
    }

    @Get('company/:companyId')
    @UseGuards(AuthGuard('jwt'))
    async findByCompanyId(@Param('companyId', ParseIntPipe) companyId: number) {
        return this.reviewService.findByCompanyId(companyId);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReviewDto: UpdateReviewDto,
        @Req() req: AuthRequest
    ) {
        try {
            return await this.reviewService.update(id, updateReviewDto);
        } catch (error) {
            console.error('Error in update controller');
            throw error;
        }
    }
}