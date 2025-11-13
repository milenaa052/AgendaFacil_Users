import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './review.model';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Customer } from 'src/customer/customer.model';
import { Company } from 'src/company/company.model';
import { RedisService } from 'src/redis/redis.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [SequelizeModule.forFeature([Review, Customer, Company]),
        RedisModule
    ],
    controllers: [ReviewController],
    providers: [ReviewService, RedisService],
    exports: [ReviewService, SequelizeModule],
})

export class ReviewModule {}