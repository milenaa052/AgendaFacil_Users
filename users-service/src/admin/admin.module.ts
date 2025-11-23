import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from './admin.model';
import { AdminService } from './admin.service';
import { AdminSeedService } from './admin.seed.service';
import { AdminController } from './admin.controller';
import { CompanyModule } from 'src/company/company.module';
import { CustomerModule } from 'src/customer/customer.module';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Admin]),
    forwardRef(() => CompanyModule),
    forwardRef(() => CustomerModule),
    forwardRef(() => AuthModule),
    RedisModule
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminSeedService, RedisService],
  exports: [AdminService],
})
export class AdminModule {}