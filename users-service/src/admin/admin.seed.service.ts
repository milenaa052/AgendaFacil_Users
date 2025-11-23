import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { CompanyService } from '../company/company.service'
import { CustomerService } from 'src/customer/customer.service';
import { AuthService } from '../auth/auth.service';
import { UserType } from './admin.model';

@Injectable()
export class AdminSeedService implements OnModuleInit {
    private readonly SERVICE_ADMIN_DATA = {
        name: 'Serviço Agendamento CRON',
        corporateReason: 'Serviço Interno',
        email: 'service-cron@suaapp.com',
        type: UserType.ADMIN,
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly adminService: AdminService,
        private readonly companyService: CompanyService,
        private readonly customerService: CustomerService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) {}

    async onModuleInit() {
        await this.ensureServiceCompanyExists();
    }

    private async ensureServiceCompanyExists() {
        const SERVICE_EMAIL = this.SERVICE_ADMIN_DATA.email;
        const SERVICE_PASSWORD = this.configService.get<string>('SERVICE_PASSWORD_CRON'); 

        if (!SERVICE_PASSWORD) {
            console.error('🚨 [SEED ERROR] SERVICE_PASSWORD_CRON não definida. Usuário de serviço não criado.');
            return;
        }

        try {
            let serviceAdmin = await this.adminService.findByEmail(SERVICE_EMAIL);
            const serviceCompany = await this.companyService.findByEmail(SERVICE_EMAIL);
            const serviceCustomer = await this.customerService.findByEmail(SERVICE_EMAIL);

            if (serviceAdmin || serviceCompany || serviceCustomer) {
                console.log('✅ Usuário de serviço (CRON) já existe.');

                serviceAdmin = serviceAdmin || (serviceAdmin = await this.adminService.findByEmail(SERVICE_EMAIL));
                if (!serviceAdmin) {
                    console.warn('⚠️ Usuário de serviço existe como Company/Customer. Tentando login.');
                }
            } else {
                console.log('⏳ Criando usuário de serviço (CRON) como ADMIN...');
                
                const adminData = {
                    ...this.SERVICE_ADMIN_DATA,
                    password: SERVICE_PASSWORD
                };

                serviceAdmin = await this.adminService.create(adminData);
                console.log('🎉 Usuário de serviço (CRON) criado com sucesso!');
            }

            const loginResponse = await this.authService.login({
                email: SERVICE_EMAIL,
                password: SERVICE_PASSWORD,
            });
            
            console.log('\n================================================================================================');
            console.log('🔑 TOKEN DE SERVIÇO JWT GERADO:');
            console.log(loginResponse.token);
            console.log('================================================================================================\n');

        } catch (error) {
            console.error('❌ Falha crítica no AdminSeedService:', error.message);
        }
    }
}