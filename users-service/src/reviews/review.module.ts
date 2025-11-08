import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './review.model';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Customer } from 'src/customer/customer.model';
import { Company } from 'src/company/company.model';

@Module({
    imports: [SequelizeModule.forFeature([Review, Customer, Company])],
    controllers: [ReviewController],
    providers: [ReviewService],
    exports: [ReviewService],
})

export class ReviewModule {}