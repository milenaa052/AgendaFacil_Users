import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CustomerModule } from 'src/customer/customer.module';
import { HttpModule } from 'src/http/http.module';
import { HttpService } from 'src/http/http.service';
import { ReviewModule } from 'src/reviews/review.module';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [SequelizeModule.forFeature([Company]),
    forwardRef(() => CustomerModule),
    HttpModule,
    ReviewModule,
    RedisModule
  ],
  controllers: [CompanyController],
  providers: [CompanyService, HttpService, RedisService],
  exports: [CompanyService],
})
export class CompanyModule {}