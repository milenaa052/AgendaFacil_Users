import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [SequelizeModule.forFeature([Company]),
    forwardRef(() => CustomerModule)
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}