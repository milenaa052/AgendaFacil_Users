import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Review } from './review.model';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { CustomerModule } from 'src/customer/customer.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
    imports: [SequelizeModule.forFeature([Review]),
        forwardRef(() => CompanyModule),
        forwardRef(() => CustomerModule)
    ],
    controllers: [ReviewController],
    providers: [ReviewService],
    exports: [ReviewService],
})

export class ReviewModule {}