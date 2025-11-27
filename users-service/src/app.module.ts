import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerModule } from './customer/customer.module';
import { CompanyModule } from './company/company.module';
import { AuthModule } from './auth/auth.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewModule } from './reviews/review.module';
import { RedisModule } from './redis/redis.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'usersdb',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    AdminModule,
    CustomerModule,
    CompanyModule,
    AuthModule,
    FavoritesModule,
    ReviewModule,
    RedisModule,
  ],
})
export class AppModule {}
