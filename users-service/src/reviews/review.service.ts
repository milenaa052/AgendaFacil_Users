import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './review.model';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-reviews.dto';
import { ReviewStatus } from './review.model';
import { Customer } from 'src/customer/customer.model';
import { Company } from 'src/company/company.model';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review) private reviewModel: typeof Review,
        @InjectModel(Customer) private customerModel: typeof Customer,
        @InjectModel(Company) private companyModel: typeof Company
    ) {}

    async create(createReviewDto: CreateReviewDto): Promise<Review> {
        const requiredFields = ['customerId', 'companyId', 'date', 'rating', 'comment'];
        for (const field of requiredFields) {
            if (!createReviewDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        const customer = await this.customerModel.findByPk(createReviewDto.customerId);
        if(!customer) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const company = await this.companyModel.findByPk(createReviewDto.companyId);
        if(!company) {
            throw new NotFoundException('Empresa não encontrada!');
        }

        if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
            throw new BadRequestException('A avaliação deve estar entre 1 e 5');
        }

        try {
            const reviewData = {
                customerId: createReviewDto.customerId,
                companyId: createReviewDto.companyId,
                date: new Date(createReviewDto.date),
                rating: createReviewDto.rating,
                comment: createReviewDto.comment,
                status: ReviewStatus.ACTIVE
            };

            return await this.reviewModel.create(reviewData);
        } catch (error) {
            throw new BadRequestException('Erro ao criar a avaliação!');
        }
    }

    async findAll() {
        return await this.reviewModel.findAll();
    }

    async findById(id: number) {
        const review = await this.reviewModel.findByPk(id);
        
        if (!review) throw new NotFoundException('Avaliação não encontrada!');
        return review;
    }

    async findByCompanyId(companyId: number) {
        const company = await this.companyModel.findByPk(companyId);
        if(!company) {
            throw new NotFoundException('Empresa não encontrada!');
        }

        const reviews = await this.reviewModel.findAll({
            where: { companyId },
            include: [
                {
                    model: Customer,
                    attributes: ['idCustomer', 'name']
                },
                {
                    model: Company,
                    attributes: ['idCompany', 'name']
                }
            ],
            order: [['date', 'DESC']]
        });
        return reviews;
    }

    async update(id: number, dto: UpdateReviewDto) {
        const review = await this.reviewModel.findByPk(id);
        if (!review) {
            throw new NotFoundException('Avaliação não encontrada!');
        }

        if (dto.customerId) {
            const customer = await this.customerModel.findByPk(dto.customerId);
            if (!customer) {
                throw new NotFoundException('Cliente não encontrado"!');
            }
        }

        if (dto.companyId) {
            const company = await this.companyModel.findByPk(dto.companyId);
            if (!company) {
                throw new NotFoundException('Empresa não encontrada!');
            }
        }

        if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
            throw new BadRequestException('A avaliação deve estar entre 1 e 5');
        }

        if (dto.status && dto.status !== ReviewStatus.ACTIVE && dto.status !== ReviewStatus.INACTIVE) {
            throw new BadRequestException('Status deve ser ACTIVE ou INACTIVE');
        }

        try {
            Object.assign(review, dto);
            await review.save();
            return review;
        } catch (error) {
            throw new BadRequestException('Erro ao atualizar a avaliação!');
        }
    }
}