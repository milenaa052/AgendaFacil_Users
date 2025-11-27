import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { fn, col, literal } from 'sequelize';
import { Favorites } from './favorites.model';
import { CreateFavoritesDto } from './dto/create-favorites.dto';
import { Customer } from 'src/customer/customer.model';
import { Company } from 'src/company/company.model';
import { Review } from 'src/reviews/review.model';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectModel(Favorites) private favoritesModel: typeof Favorites,
        @InjectModel(Customer) private customerModel: typeof Customer,
        @InjectModel(Company) private companyModel: typeof Company,
        @InjectModel(Review) private reviewModel: typeof Review,
    ) {}

    async create(createFavoritesDto: CreateFavoritesDto) {

        if (!createFavoritesDto.customerId || !createFavoritesDto.companyId) {
            throw new BadRequestException('Todos os campos são obrigatórios!');
        }

        const customer = await this.customerModel.findByPk(createFavoritesDto.customerId);
        if(!customer) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const company = await this.companyModel.findByPk(createFavoritesDto.companyId);
        if(!company) {
            throw new NotFoundException('Empresa não encontrada!');
        }

        const existingFavorite = await this.favoritesModel.findOne({
            where: {
                customerId: createFavoritesDto.customerId,
                companyId: createFavoritesDto.companyId,
            }
        });

        if (existingFavorite) {
            throw new BadRequestException('Está empresa já foi favoritada!')
        }

        try {
            const favoritesData = {
                customerId: createFavoritesDto.customerId,
                companyId: createFavoritesDto.companyId
            }

            return await this.favoritesModel.create(favoritesData);
        } catch (error) {
            throw new BadRequestException('Erro ao adicionar aos favoritos!');
        }
    }

    async findAll() {
        return await this.favoritesModel.findAll({
            include: [{ 
                model: Company,
                attributes: ['idCompany', 'name', 'street', 'number', 'averagePrice']
            }]
        });
    }

    async findById(id: number) {
        const favorites = await this.favoritesModel.findByPk(id, {
            include: [{ 
                model: Company,
                attributes: ['idCompany', 'name', 'street', 'number', 'averagePrice']
            }]
        });
        
        if (!favorites) throw new NotFoundException('Favorito não encontrado!');
        return favorites;
    }

    async findByCustomerFavorites(customerId: number) {
        const customer = await this.customerModel.findByPk(customerId);
        if (!customer) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const favorites = await this.favoritesModel.findAll({
            where: { customerId },
            include: [{ 
                model: Company,
                as: 'company',
                attributes: [
                    'idCompany', 
                    'name', 
                    'street', 
                    'number', 
                    'averagePrice', 
                    [fn('ROUND', fn('AVG', col('company.reviews.rating')), 1), 'averageRating']
                ],
                include: [{
                    model: Review,
                    as: 'reviews',
                    attributes: []
                }]
            }],
            group: [
                'Favorites.idFavorites',
                'company.idCompany'
            ]
        });

        return favorites;
    }

    async deleteById(id: number): Promise<{ message: string }> {
        const favorites = await this.favoritesModel.findByPk(id);
        
        if (!favorites) {
            throw new NotFoundException('Favorito não encontrado!');
        }

        await favorites.destroy();
        return { message: 'Favorito deletado com sucesso!' };
    }
}