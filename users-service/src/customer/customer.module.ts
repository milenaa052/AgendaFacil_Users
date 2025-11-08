import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from './customer.model';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CompanyModule } from 'src/company/company.module';

@Module({
    imports: [SequelizeModule.forFeature([Customer]),
        forwardRef(() => CompanyModule)
    ],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService],
})

export class CustomerModule {}