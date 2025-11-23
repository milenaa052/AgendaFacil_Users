import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CustomerService } from '../customer/customer.service';
import { Customer } from '../customer/customer.model';
import { Company } from 'src/company/company.model';
import { Admin } from 'src/admin/admin.model';
import { AdminService } from 'src/admin/admin.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.interface';
import { LoginResponse, ProfileResponse } from './types/auth-response.interface';
import { CompanyService } from 'src/company/company.service';

export type UserType = 'CUSTOMER' | 'COMPANY' | 'ADMIN';

export interface AuthenticatedUser {
    idUser: number;
    name: string;
    email: string;
    state?: string;
    city?: string;
    street?: string;
    number?: number;
    complement?: string;
    userType: UserType;
}

@Injectable()
export class AuthService {
    constructor(
        private customerService: CustomerService,
        private companyService: CompanyService,
        private adminService: AdminService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
        let user: Customer | Company | Admin | null = await this.customerService.findByEmail(email);
        let userType: UserType = 'CUSTOMER';

        if (!user) {
            user = await this.companyService.findByEmail(email);
            userType = 'COMPANY';
        }

        if (!user) {
            user = await this.adminService.findByEmail(email);
            userType = 'ADMIN';
        }
        
        if (!user) {
        throw new UnauthorizedException('Credenciais Inválidas!');
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais Inválidas!');
        }

        let idUser: number;
        
        if (userType === 'CUSTOMER') {
            idUser = (user as Customer).idCustomer;
        } else if (userType === 'COMPANY') {
            idUser = (user as Company).idCompany;
        } else {
            idUser = (user as Admin).idAdmin;
        }

        const addressFields = userType !== 'ADMIN' ? {
            state: (user as Customer | Company).state,
            city: (user as Customer | Company).city,
            street: (user as Customer | Company).street,
            number: (user as Customer | Company).number,
            complement: (user as Customer | Company).complement,
        } : {};

        return {
            idUser: idUser,
            name: user.name,
            email: user.email,
            ...addressFields,
            userType: userType
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new BadRequestException('Email e senha são obrigatórios!');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestException('Formato de email inválido!');
        }

        const user = await this.validateUser(email, password);

        const payload: JwtPayload = {
            idUser: user.idUser,
            name: user.name,
            email: user.email,
            userType: user.userType
        };

        let signOptions: JwtSignOptions = {}; 

        if (user.userType !== 'ADMIN') {
            signOptions.expiresIn = '7d';
        }

        return {
            message: 'Login realizado com sucesso!',
            token: this.jwtService.sign(payload, signOptions), 
            user: user
        };
    }

    async getProfile(userId: number, userType: UserType): Promise<ProfileResponse> {
        let user: Customer | Company | Admin | null = null;

        if (userType === 'CUSTOMER') {
            user = await this.customerService.findById(userId);
        } else if (userType === 'COMPANY') {
            user = await this.companyService.findById(userId);
        } else if (userType === 'ADMIN') {
            user = await this.adminService.findById(userId);
        }
        
        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado!');
        }

        let idUser: number;
        
        if (userType === 'CUSTOMER') {
            idUser = (user as Customer).idCustomer;
        } else if (userType === 'COMPANY') {
            idUser = (user as Company).idCompany;
        } else {
            idUser = (user as Admin).idAdmin;
        }

        const addressFields = userType !== 'ADMIN' ? {
            state: (user as Customer | Company).state,
            city: (user as Customer | Company).city,
            street: (user as Customer | Company).street,
            number: (user as Customer | Company).number,
            complement: (user as Customer | Company).complement,
        } : {};

        return {
            message: 'Usuário autenticado com sucesso!',
            user: {
                idUser: idUser,
                name: user.name,
                email: user.email,
                ...addressFields,
                userType: userType
            }
        };
    }

    async checkEmailExists(email: string): Promise<{ exists: boolean; userType?: UserType }> {
        const customer = await this.customerService.findByEmail(email);
        if (customer) {
            return { exists: true, userType: 'CUSTOMER' };
        }

        const company = await this.companyService.findByEmail(email);
        if (company) {
            return { exists: true, userType: 'COMPANY' };
        }

        const admin = await this.adminService.findByEmail(email);
        if (admin) {
            return { exists: true, userType: 'ADMIN' };
        }

        return { exists: false };
    }
}