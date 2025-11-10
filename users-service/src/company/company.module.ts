import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CustomerModule } from 'src/customer/customer.module';
import { HttpModule } from 'src/http/http.module';
import { HttpService } from 'src/http/http.service';

@Module({
  imports: [SequelizeModule.forFeature([Company]),
    forwardRef(() => CustomerModule),
    HttpModule
  ],
  controllers: [CompanyController],
  providers: [CompanyService, HttpService],
  exports: [CompanyService],
})
export class CompanyModule {}