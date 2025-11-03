import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from './customer.model';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CompanyService } from '../company/company.service';
import { Company } from '../company/company.model';

@Module({
    imports: [SequelizeModule.forFeature([Customer, Company])],
    controllers: [CustomerController],
    providers: [CustomerService, CompanyService],
    exports: [CustomerService],
})

export class CustomerModule {}