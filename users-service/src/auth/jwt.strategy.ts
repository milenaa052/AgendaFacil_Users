import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Customer } from 'src/customer/customer.model';
import { Company } from 'src/company/company.model';
import { Admin } from 'src/admin/admin.model';
import { CustomerService } from '../customer/customer.service';
import { CompanyService } from 'src/company/company.service';
import { AdminService } from 'src/admin/admin.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AuthenticatedUser } from './types/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private customerService: CustomerService,
        private companyService: CompanyService,
        private adminService: AdminService,
        private configService: ConfigService
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        let user: Customer | Company | Admin | null = null; 

        if (payload.userType === 'CUSTOMER') {
            user = await this.customerService.findById(payload.idUser);
        } else if (payload.userType === 'COMPANY') {
            user = await this.companyService.findById(payload.idUser);
        } else if (payload.userType === 'ADMIN') {
            user = await this.adminService.findById(payload.idUser);
        }
        
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        let idUser: number;
        let userAddressFields: Partial<AuthenticatedUser> = {};

        if (payload.userType === 'CUSTOMER') {
            const customerUser = user as Customer;
            idUser = customerUser.idCustomer;
        } else if (payload.userType === 'COMPANY') {
            const companyUser = user as Company;
            idUser = companyUser.idCompany;
        } else {
            const adminUser = user as Admin;
            idUser = adminUser.idAdmin;
        }

        return {
            idUser: idUser,
            name: user.name,
            email: user.email,
            userType: payload.userType,
            ...userAddressFields
        };
    }
}