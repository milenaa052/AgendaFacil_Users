import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerService } from '../customer/customer.service';
import { Customer } from '../customer/customer.model';
import { Company } from 'src/company/company.model';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.interface';
import { LoginResponse, ProfileResponse } from './types/auth-response.interface';
import { CompanyService } from 'src/company/company.service';

export type UserType = 'CUSTOMER' | 'COMPANY';

export interface AuthenticatedUser {
    idUser: number;
    name: string;
    email: string;
    userType: UserType;
}

@Injectable()
export class AuthService {
    constructor(
        private customerService: CustomerService,
        private companyService: CompanyService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
        let user: Customer | Company | null = await this.customerService.findByEmail(email);
        let userType: UserType = 'CUSTOMER';

        if (!user) {
            user = await this.companyService.findByEmail(email);
            userType = 'COMPANY';
        }
        
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            idUser: userType === 'CUSTOMER' 
                ? (user as Customer).idCustomer 
                : (user as Company).idCompany,
            name: user.name,
            email: user.email,
            userType: userType
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestException('Invalid email format');
        }

        const user = await this.validateUser(email, password);

        const payload: JwtPayload = {
            idUser: user.idUser,
            name: user.name,
            email: user.email,
            userType: user.userType
        };

        return {
            message: 'Login successfully',
            token: this.jwtService.sign(payload),
            user: user
        };
    }

    async getProfile(userId: number, userType: UserType): Promise<ProfileResponse> {
        let user: Customer | Company | null = null;

        if (userType === 'CUSTOMER') {
            user = await this.customerService.findById(userId);
        } else if (userType === 'COMPANY') {
            user = await this.companyService.findById(userId);
        }
        
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            message: 'User successfully authenticated',
            user: {
                idUser: userType === 'CUSTOMER' 
                    ? (user as Customer).idCustomer 
                    : (user as Company).idCompany,
                name: user.name,
                email: user.email,
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

        return { exists: false };
    }
}