import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { cpf } from 'cpf-cnpj-validator';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from './customer.model';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UserType } from './customer.model';
import { CompanyService } from 'src/company/company.service';

@Injectable()
export class CustomerService {
    constructor(
        @InjectModel(Customer) private customerModel: typeof Customer,
        @Inject(forwardRef(() => CompanyService))
        private companyService: CompanyService
    ) {}

    async checkEmailExists(email: string) {
        const customer = await this.findByEmail(email);
        if (customer) {
            return true;
        }

        const company = await this.companyService.findByEmail(email);
        if (company) {
            return true;
        }
    }

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const requiredFields = ['name', 'cpf', 'phone', 'state', 'city', 'street', 'number', 'email', 'password'];
        for (const field of requiredFields) {
            if (!createCustomerDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        const existingCustomer = await this.customerModel.findOne({
            where: { cpf: createCustomerDto.cpf }
        });

        if (existingCustomer) {
            throw new BadRequestException('CPF já cadastrado!');
        }

        if(!cpf.isValid(createCustomerDto.cpf)) {
            throw new BadRequestException('CPF inválido ou inexistente!');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(createCustomerDto.email)) {
            throw new BadRequestException('Formato de email inválido!');
        }

        const emailExists = await this.checkEmailExists(createCustomerDto.email);
        if (emailExists) {
            throw new ConflictException('Este email já está cadastrado!');
        }

        const passwordValidation = Customer.validatePasswordLevel(createCustomerDto.password);
        if (!passwordValidation.validate) {
            throw new BadRequestException({
                message: 'Senha muito fraca',
                details: passwordValidation.requirements,
            });
        }
 
        try {
            const customerData = {
                name: createCustomerDto.name,
                cpf: createCustomerDto.cpf,
                phone: createCustomerDto.phone,
                state: createCustomerDto.state,
                city: createCustomerDto.city,
                street: createCustomerDto.street,
                number: createCustomerDto.number,
                complement: createCustomerDto.complement,
                email: createCustomerDto.email,
                password: createCustomerDto.password,
                type: UserType.CUSTOMER
            };

            return await this.customerModel.create(customerData);
        } catch (error) {
            throw new BadRequestException('Erro ao criar o usuário!');
        }
    }

    async findAll() {
        return await this.customerModel.findAll();
    }

    async findById(id: number) {
        const customer = await this.customerModel.findByPk(id);
        
        if (!customer) throw new NotFoundException('Cliente não encontrado!');
        return customer;
    }

    async findByEmail(email: string): Promise<Customer | null> {
        return this.customerModel.findOne({
            where: { email }
        });
    }

    async update(id: number, customerId: number, updateCustomerDto: UpdateCustomerDto) {
        if (id !== customerId) {
            throw new ForbiddenException('Você não tem permissão para editar este usuário!');
        }

        const customer = await this.customerModel.findByPk(id);
        if (!customer) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        if (updateCustomerDto.cpf && updateCustomerDto.cpf !== customer.cpf) {
            const existingCustomer = await this.customerModel.findOne({
                where: { cpf: updateCustomerDto.cpf }
            });

            if (existingCustomer) {
                throw new BadRequestException('CPF já cadastrado!');
            }
        }

        if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
            throw new BadRequestException('Email não pode ser alterado!');
        }

        if (updateCustomerDto.currentPassword && updateCustomerDto.newPassword) {
            const correctPassword = await customer.validatePassword(updateCustomerDto.currentPassword);
            if (!correctPassword) {
                throw new BadRequestException('Senha atual incorreta!');
            }

            const validate = Customer.validatePasswordLevel(updateCustomerDto.newPassword);
            if (!validate.validate) {
                throw new BadRequestException({
                    error: 'Senha muito fraca!',
                    details: validate.requirements,
                });
            }

            customer.password = updateCustomerDto.newPassword;
        }

        try {
            Object.assign(customer, updateCustomerDto);
            await customer.save();
            return customer;
        } catch (error) {
            throw new BadRequestException('Erro ao atualizar o usuário!');
        }
    }
}