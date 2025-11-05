import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserType } from './company.model';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(Company)
        private readonly companyModel: typeof Company,
    ) {}

    async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
        const existingCompany = await this.companyModel.findOne({
            where: { cnpj: createCompanyDto.cnpj }
        });

        if (existingCompany) {
            throw new BadRequestException('CNPJ já cadastrado');
        }

        try {
            return await this.companyModel.create({
                ...createCompanyDto,
                type: UserType.COMPANY
            } as any);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    async findAll() {
        return await this.companyModel.findAll();
    }

    async findById(id: number) {
        const company = await this.companyModel.findByPk(id);

        if (!company) throw new NotFoundException('Company not found');
        return company;
    }

    async findByEmail(email: string): Promise<Company | null> {
        return this.companyModel.findOne({
            where: { email }
        });
    }

    async update(id: number, companyId: number, updateCompanyDto: UpdateCompanyDto) {
        if(id !== companyId)
        throw new ForbiddenException('You do not have permission to edit this user');
        
        const company = await this.companyModel.findByPk(id);
        if (!company) throw new NotFoundException('User not found');
        
        if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
            const existingCompany = await this.companyModel.findOne({
                where: { cnpj: updateCompanyDto.cnpj }
            });

            if (existingCompany) {
                throw new BadRequestException('CNPJ já cadastrado');
            }
        }

        if(updateCompanyDto.currentPassword && updateCompanyDto.newPassword) {
            const correctPassword = await company.validatePassword(updateCompanyDto.currentPassword);
            if(!correctPassword)
                throw new BadRequestException('Incorrect current password');

            const validate = Company.validatePasswordLevel(updateCompanyDto.newPassword);
            if (!validate.validate)
                throw new BadRequestException({
                    error: 'Password too weak',
                    details: validate.requirements,
                });

                company.password = updateCompanyDto.newPassword;
        }

        Object.assign(company, updateCompanyDto);
        await company.save();
        return company;
    }
}