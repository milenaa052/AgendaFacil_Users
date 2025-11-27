import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { cnpj } from 'cpf-cnpj-validator';
import { InjectModel } from '@nestjs/sequelize';
import { Company } from './company.model';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserType } from './company.model';
import { CustomerService } from 'src/customer/customer.service';
import {
  removeFileByUrl,
  avatarUrlFromFilename,
} from 'src/uploads/upload.utils';
import { extname } from 'path';
import { existsSync } from 'fs';
import { Review } from 'src/reviews/review.model';
import { HttpService } from 'src/http/http.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company)
    private readonly companyModel: typeof Company,
    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
    @InjectModel(Review) private reviewModel: typeof Review,
    private http: HttpService,
    private redis: RedisService,
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
    const requiredFields = [
      'name',
      'corporateReason',
      'cnpj',
      'rayKm',
      'phone',
      'state',
      'city',
      'street',
      'number',
      'category',
      'profession',
      'averagePrice',
      'email',
      'password',
    ];

    for (const field of requiredFields) {
      if (!createCompanyDto[field]) {
        throw new BadRequestException('Todos os campos são obrigatórios!');
      }
    }

    if (!cnpj.isValid(createCompanyDto.cnpj)) {
      throw new BadRequestException('CNPJ inválido ou inexistente!');
    }

    const existingCompany = await this.companyModel.findOne({
      where: { cnpj: createCompanyDto.cnpj },
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

    const passwordValidation = Company.validatePasswordLevel(
      createCompanyDto.password,
    );
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
        averagePrice: createCompanyDto.averagePrice,
        email: createCompanyDto.email,
        password: createCompanyDto.password,
        type: UserType.COMPANY,
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
      where: { email },
    });
  }

  async findByAvailableCompanies(
    state: string,
    city: string,
    category: string,
    profession: string,
    date: string,
    hour: string,
    token: string,
  ): Promise<
    {
      idCompany: number;
      name: string;
      averagePrice: number;
      reviews: Review[];
    }[]
  > {
    if (!state || !city || !category || !profession || !date || !hour) {
      throw new BadRequestException('Todos os parâmetros são obrigatórios!');
    }

    const companies = await this.companyModel.findAll({
      where: { state, city, category, profession },
    });

    if (!companies.length) {
      throw new NotFoundException(
        `Nenhum profissional cadastrado para a profissão ${profession} na sua região!`,
      );
    }

    const availableCompanies: {
      idCompany: number;
      name: string;
      averagePrice: number;
      averageRating: number;
      reviews: Review[];
    }[] = [];

    for (const company of companies) {
      try {
        const response = await this.http.instance.get(
          `/scheduling-company/company/${company.idCompany}`,
          { headers: { Authorization: token } },
        );

        const schedulings = response.data;

        const hasConflict = schedulings.some((scheduling: any) => {
          if (scheduling.status === 'CANCELLED') return false;

          const isSameDate = (d1: string, d2: string) => d1 === d2;
          const toDate = (str: string) => new Date(str + "T00:00:00");

          const matchesRecurrence = (scheduling: any, requestedDate: string) => {
            const start = toDate(scheduling.startDate);
            const req = toDate(requestedDate);

            if (req < start) return false;

            switch (scheduling.repeatScheduling) {
              case "DAYS":
                return true;

              case "WEEKS":
                const diffDaysWeek = Math.floor((req.getTime() - start.getTime()) / (1000*60*60*24));
                return diffDaysWeek % 7 === 0;

              case "MONTHS":
                return (
                  req.getDate() === start.getDate()
                );

              case "YEARS":
                return (
                  req.getDate() === start.getDate() &&
                  req.getMonth() === start.getMonth()
                );

              default:
                return isSameDate(scheduling.startDate, requestedDate);
            }
          };

          if (!matchesRecurrence(scheduling, date)) return false;

          const toMinutes = (h: string) => {
            const [hh, mm] = h.split(':').map(Number);
            return hh * 60 + mm;
          };

          const requested = toMinutes(hour);
          const start = toMinutes(scheduling.startHour);
          const end = toMinutes(scheduling.endHour);

          const requestedStart = requested;
          const requestedEnd = requested + 1;

          return requestedStart < end && start < requestedEnd;
        });

        if (!hasConflict) {
          const reviews = await this.reviewModel.findAll({
            where: { companyId: company.idCompany },
            order: [['date', 'DESC']],
          });

          const averageRating = reviews.length
            ? reviews.reduce((acc, review) => acc + review.rating, 0) /
              reviews.length
            : 0;

          availableCompanies.push({
            idCompany: company.idCompany,
            name: company.name,
            averagePrice: company.averagePrice,
            averageRating: Number(averageRating.toFixed(1)),
            reviews: reviews as Review[],
          });
        }
      } catch (error: unknown) {
        const err = error as any;

        if (err.response?.status === 404) {
          const reviews = await this.reviewModel.findAll({
            where: { companyId: company.idCompany },
            order: [['date', 'DESC']],
          });
          const averageRating = reviews.length
            ? reviews.reduce((acc, review) => acc + review.rating, 0) /
              reviews.length
            : 0;

          availableCompanies.push({
            idCompany: company.idCompany,
            name: company.name,
            averagePrice: company.averagePrice,
            averageRating: Number(averageRating.toFixed(1)),
            reviews: reviews as Review[],
          });
        } else {
          throw new BadRequestException(
            err.response?.data?.message || 'Erro ao verificar disponibilidade',
          );
        }
      }
    }

    if (!availableCompanies.length) {
      throw new NotFoundException(
        'Nenhum profissional com horário disponível, volte na tela anterior e escolha outro horário.',
      );
    }

    return availableCompanies;
  }

  async update(
    id: number,
    companyId: number,
    updateCompanyDto: UpdateCompanyDto,
  ) {
    if (id !== companyId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este usuário!',
      );
    }

    const company = await this.companyModel.findByPk(id);
    if (!company) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
      const existingCompany = await this.companyModel.findOne({
        where: { cnpj: updateCompanyDto.cnpj },
      });

      if (existingCompany) {
        throw new BadRequestException('CNPJ já cadastrado!');
      }
    }

    if (updateCompanyDto.email && updateCompanyDto.email !== company.email) {
      throw new BadRequestException('Email não pode ser alterado!');
    }

    if (updateCompanyDto.currentPassword && updateCompanyDto.newPassword) {
      const correctPassword = await company.validatePassword(
        updateCompanyDto.currentPassword,
      );
      if (!correctPassword) {
        throw new BadRequestException('Senha atual incorreta!');
      }

      const validate = Company.validatePasswordLevel(
        updateCompanyDto.newPassword,
      );
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

  async updateAvatar(
    id: number,
    requesterId: number,
    requesterType: string,
    file: Express.Multer.File,
  ) {
    if (id !== requesterId && requesterType !== 'ADMIN') {
      throw new ForbiddenException(
        'Você não tem permissão para alterar este avatar!',
      );
    }

    const company = await this.companyModel.findByPk(id);
    if (!company) {
      throw new NotFoundException('Usuário não encontrado!');
    }

    const oldAvatar = company.avatarUrl;

    if (!file || !file.filename || !file.path) {
      throw new BadRequestException('Arquivo não enviado ou inválido');
    }

    // Strong validation: check magic-bytes (file-type) and extension
    try {
      const { fileTypeFromFile } = await import('file-type');
      const fileType = await fileTypeFromFile(file.path);
      const allowedExts = ['jpg', 'jpeg', 'png'];
      if (!fileType || !allowedExts.includes(fileType.ext)) {
        await removeFileByUrl(file.path);
        throw new BadRequestException(
          'Arquivo inválido. Apenas imagens jpg, jpeg e png são permitidas.',
        );
      }

      const originalExt = extname(file.originalname || '')
        .replace('.', '')
        .toLowerCase();
      if (originalExt && originalExt !== fileType.ext) {
        await removeFileByUrl(file.path);
        throw new BadRequestException(
          'Extensão do arquivo não confere com conteúdo.',
        );
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      try {
        if (file && file.path && existsSync(file.path))
          await removeFileByUrl(file.path);
      } catch (e) {
        // ignore
      }
      throw new BadRequestException('Erro ao validar imagem enviada');
    }

    company.avatarUrl = avatarUrlFromFilename(file.filename);

    try {
      await company.save();
      if (oldAvatar) await removeFileByUrl(oldAvatar);
      return company;
    } catch (err) {
      await removeFileByUrl(avatarUrlFromFilename(file.filename));
      throw new BadRequestException('Erro ao atualizar avatar');
    }
  }
}
