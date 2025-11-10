import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { cnpj } from 'cpf-cnpj-validator';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserType } from './company.model';
import { CustomerService } from 'src/customer/customer.service';
import { HttpService } from 'src/http/http.service';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(Company)
        private readonly companyModel: typeof Company,
        @Inject(forwardRef(() => CustomerService))
        private customerService: CustomerService,
        private http: HttpService
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

        try {
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
        } catch (error) {
            throw new BadRequestException('Erro ao criar usuário!');
        }
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

    async findByAvailableCompanies(
        state: string,
        city: string,
        category: string,
        profession: string,
        date: string,
        hour: string,
        token: string
    ) {
        if (!state || !city || !category || !profession || !date || !hour) {
            throw new BadRequestException('Todos os parâmetros são obrigatórios!');
        }

        const companies = await this.companyModel.findAll({
            where: { state, city, category, profession }
        });

        if (!companies.length) {
            throw new NotFoundException('Nenhuma empresa encontrada com os filtros informados!');
        }

        const availableCompanies: Company[] = [];

        for (const company of companies) {
            try {
                const response = await this.http.instance.get(
                    `/scheduling-company/company/${company.idCompany}`,
                    { headers: { Authorization: token } }
                );

                const schedulings = response.data;

                const hasConflict = schedulings.some((scheduling: any) => {
                    if (scheduling.startDate !== date) return false;

                    const toMinutes = (h: string) => {
                        const [hh, mm] = h.split(':').map(Number);
                        return hh * 60 + mm;
                    };

                    const requested = toMinutes(hour);
                    const start = toMinutes(scheduling.startHour);
                    const end = toMinutes(scheduling.endHour);

                    return requested >= start && requested < end;
                });

                if (!hasConflict) {
                    availableCompanies.push(company);
                }

            } catch (error) {
                if (error.response?.status === 404) {
                    availableCompanies.push(company);
                } else {
                    throw new BadRequestException(
                        error.response?.data?.message || 'Erro ao verificar disponibilidade'
                    );
                }
            }
        }

        return availableCompanies;
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

        try {
            Object.assign(company, updateCompanyDto);
            await company.save();
            return company;

        } catch (error) {
            throw new BadRequestException('Erro ao atualizar o usuário!');
        }
    }
}