import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Favorites } from './favorites.model';
import { CreateFavoritesDto } from './dto/create-favorites.dto';
import { Customer } from 'src/customer/customer.model';
import { Company } from 'src/company/company.model';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectModel(Favorites) private favoritesModel: typeof Favorites,
        @InjectModel(Customer) private customerModel: typeof Customer,
        @InjectModel(Company) private companyModel: typeof Company
    ) {}

    async create(createFavoritesDto: CreateFavoritesDto) {

        if (!createFavoritesDto.customerId || !createFavoritesDto.companyId) {
            return { message: 'All fields are required' };
        }

       const customer = await this.customerModel.findByPk(createFavoritesDto.customerId);
       if(!customer) {
            return { message: 'Customer not found' }
       }

       const company = await this.companyModel.findByPk(createFavoritesDto.companyId);
       if(!company) {
            return { message: 'Company not found' }
       }

        try {
            const favorite = await this.favoritesModel.create({
                ...createFavoritesDto
            } as any);

            return {
                message: 'Favorite created successfully',
                favorite
            };

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