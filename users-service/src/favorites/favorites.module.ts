import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Favorites } from './favorites.model';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Customer } from 'src/customer/customer.model';
import { Company } from 'src/company/company.model';

@Module({
    imports: [SequelizeModule.forFeature([Favorites, Customer, Company])],
    controllers: [FavoritesController],
    providers: [FavoritesService],
    exports: [FavoritesService],
})

export class FavoritesModule {}