import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from './customer.model';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CompanyService } from '../company/company.service';

@Injectable()
export class CustomerService {
    constructor(
        @InjectModel(Customer) private customerModel: typeof Customer,
    ) {}

    async create(createCustomerDto: CreateCustomerDto) {

        if (!createCustomerDto.password) {
            throw new BadRequestException('Password is required');
        }

        const passwordValidation = Customer.validatePasswordLevel(createCustomerDto.password);
        if (!passwordValidation.validate) {
            throw new BadRequestException({
                error: 'Password too weak',
                details: passwordValidation.requirements,
            });
        }

        try {
            return this.customerModel.create(createCustomerDto as any);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    async findAll() {
        return await this.customerModel.findAll();
    }

    async findById(id: number) {
        const customer = await this.customerModel.findByPk(id);
        
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async findByEmail(email: string): Promise<Customer | null> {
        return this.customerModel.findOne({
            where: { email }
        });
    }

    async update(id: number, customerId: number, dto: UpdateCustomerDto) {
        if (id !== customerId)
        throw new ForbiddenException('You do not have permission to edit this customer');

        const customer = await this.customerModel.findByPk(id);
        if (!customer) throw new NotFoundException('User not found');

        if (dto.email && dto.email !== customer.email)
        throw new BadRequestException('Changing email is not allowed');

        if (dto.currentPassword && dto.newPassword) {
            const correctPassword = await customer.validatePassword(dto.currentPassword);
            if (!correctPassword)
                throw new BadRequestException('Incorrect current password');

            const validate = Customer.validatePasswordLevel(dto.newPassword);
            if (!validate.validate)
                throw new BadRequestException({
                    error: 'Password too weak',
                    details: validate.requirements,
                });

                customer.password = dto.newPassword;
        }

        Object.assign(customer, dto);
        await customer.save();
        return customer;
    }
}