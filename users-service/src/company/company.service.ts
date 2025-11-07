import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { cnpj } from 'cpf-cnpj-validator';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserType } from './company.model';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(Company)
        private readonly companyModel: typeof Company,
        @Inject(forwardRef(() => CustomerService))
        private customerService: CustomerService
    ) {}

    async checkEmailExists(email: string) {
        const company = await this.findByEmail(email);
        if (company) {
            return true;
        }

        const customer = await this.customerService.findByEmail(email);
        if (customer) {
            return true;
        }
    }

    async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
        const requiredFields = ['name', 'corporateReason', 'cnpj', 'rayKm', 'phone', 'state', 'city', 'street', 'number', 'category', 'profession', 'email', 'password'];
        for (const field of requiredFields) {
            if (!createCompanyDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        if(!cnpj.isValid(createCompanyDto.cnpj)) {
            throw new BadRequestException('CNPJ inválido ou inexistente!');
        }

        const existingCompany = await this.companyModel.findOne({
            where: { cnpj: createCompanyDto.cnpj }
        });

        if (existingCompany) {
            throw new BadRequestException('CNPJ já cadastrado!');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(createCompanyDto.email)) {
            throw new BadRequestException('Formato de email inválido!');
        }

        const emailExists = await this.checkEmailExists(createCompanyDto.email);
        if (emailExists) {
            throw new ConflictException('Este email já está cadastrado!');
        }

        const passwordValidation = Company.validatePasswordLevel(createCompanyDto.password);
        if (!passwordValidation.validate) {
            throw new BadRequestException({
                message: 'Senha muito fraca',
                details: passwordValidation.requirements,
            });
        }

        const companyData = {
            name: createCompanyDto.name,
            corporateReason: createCompanyDto.corporateReason,
            cnpj: createCompanyDto.cnpj,
            rayKm: createCompanyDto.rayKm,
            phone: createCompanyDto.phone,
            state: createCompanyDto.state,
            city: createCompanyDto.city,
            street: createCompanyDto.street,
            number: createCompanyDto.number,
            complement: createCompanyDto.complement,
            category: createCompanyDto.category,
            profession: createCompanyDto.profession,
            email: createCompanyDto.email,
            password: createCompanyDto.password,
            type: UserType.COMPANY
        };

        return await this.companyModel.create(companyData);
    }

    async findAll() {
        return await this.companyModel.findAll();
    }

    async findById(id: number) {
        const company = await this.companyModel.findByPk(id);

        if (!company) throw new NotFoundException('Empresa não encontrada!');
        return company;
    }

    async findByEmail(email: string): Promise<Company | null> {
        return this.companyModel.findOne({
            where: { email }
        });
    }

    async update(id: number, companyId: number, updateCompanyDto: UpdateCompanyDto) {
        if(id !== companyId) {
            throw new ForbiddenException('Você não tem permissão para editar este usuário!');
        }
        
        const company = await this.companyModel.findByPk(id);
        if (!company) {
            throw new NotFoundException('Usuário não encontrado!');
        }
        
        if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
            const existingCompany = await this.companyModel.findOne({
                where: { cnpj: updateCompanyDto.cnpj }
            });

            if (existingCompany) {
                throw new BadRequestException('CNPJ já cadastrado!');
            }
        }

        if(updateCompanyDto.currentPassword && updateCompanyDto.newPassword) {
            const correctPassword = await company.validatePassword(updateCompanyDto.currentPassword);
            if(!correctPassword) {
                throw new BadRequestException('Senha atual incorreta!');
            }

            const validate = Company.validatePasswordLevel(updateCompanyDto.newPassword);
            if (!validate.validate) {
                throw new BadRequestException({
                    message: 'Senha muito fraca!',
                    details: validate.requirements,
                });
            }

            company.password = updateCompanyDto.newPassword;
        }

        Object.assign(company, updateCompanyDto);
        await company.save();
        return company;
    }
}