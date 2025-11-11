import { Controller, Post, Get, Put, Param, Body, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from '@nestjs/passport';
import type { AuthRequest } from '../auth/types/auth-request.interface';

@Controller('company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Post()
    async create(@Body() createCompanyDto: CreateCompanyDto) {
        return this.companyService.create(createCompanyDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.companyService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.companyService.findById(id);
    }

    @Get(':state/:city/:category/:profession/:date/:hour')
    @UseGuards(AuthGuard('jwt'))
    async findByAvailableCompanies(
        @Param('state') state: string,
        @Param('city') city: string,
        @Param('category') category: string,
        @Param('profession') profession: string,
        @Param('date') date: string,
        @Param('hour') hour: string,
        @Req() req
    ) {
            const token = req.headers.authorization;
            return this.companyService.findByAvailableCompanies(
                state,
                city,
                category,
                profession,
                date,
                hour,
                token
            );
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCompanyDto: UpdateCompanyDto,
        @Req() req: AuthRequest
    ) {
        const loggedCompany = req.user.idUser;
        return this.companyService.update(id, loggedCompany, updateCompanyDto);
    }
}