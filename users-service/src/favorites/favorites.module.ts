import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Favorites } from './favorites.model';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { CustomerModule } from 'src/customer/customer.module';
import { CompanyModule } from 'src/company/company.module';

@Module({
    imports: [SequelizeModule.forFeature([Favorites]),
        forwardRef(() => CompanyModule),
        forwardRef(() => CustomerModule)
    ],
    controllers: [FavoritesController],
    providers: [FavoritesService],
    exports: [FavoritesService],
})

export class FavoritesModule {}