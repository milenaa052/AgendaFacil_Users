import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Favorites } from './favorites.model';
import { CreateFavoritesDto } from './dto/create-favorites.dto';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectModel(Favorites) private favoritesModel: typeof Favorites,
    ) {}

    async create(createFavoritesDto: CreateFavoritesDto) {

        if (!createFavoritesDto.customerId || !createFavoritesDto.companyId) {
            return { message: 'All fields are required' };
        }

        if(!createFavoritesDto.customerId) {
            return { message: 'Customer not found' };
        }

        if(!createFavoritesDto.companyId) {
            return { message: 'Company not found' };
        }

        try {
            return await this.favoritesModel.create({
                ...createFavoritesDto
            } as any);
        } catch (error) {
            return { message: 'Error when creating favorites' };
        }
    }

    async findAll() {
        return await this.favoritesModel.findAll();
    }

    async findById(id: number) {
        const favorites = await this.favoritesModel.findByPk(id);
        
        if (!favorites) throw new NotFoundException('Favorites not found');
        return favorites;
    }

    async deleteById(id: number): Promise<{ message: string }> {
        const favorites = await this.favoritesModel.findByPk(id);
        
        if (!favorites) {
            throw new NotFoundException('Favorites not found');
        }

        await favorites.destroy();
        
        return { message: 'Favorites deleted successfully' };
    }
}