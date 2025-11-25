import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  ParseIntPipe,
  UploadedFiles,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '@nestjs/passport';
import type { AuthRequest } from '../auth/types/auth-request.interface';
import multerOptions from 'src/uploads/multer.config';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Req() req: AuthRequest,
  ) {
    const loggedUser = req.user.idUser;
    return this.customerService.update(id, loggedUser, updateCustomerDto);
  }

  @Post(':id/avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'file', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  @HttpCode(200)
  async uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
    @Req() req: AuthRequest,
  ) {
    const loggedUser = req.user.idUser;
    const userType = req.user.userType;
    const file =
      (files && files['avatar'] && files['avatar'][0]) ||
      (files && files['file'] && files['file'][0]);
    if (!file) {
      throw new (require('@nestjs/common').BadRequestException)(
        'Field name missing',
      );
    }
    return this.customerService.updateAvatar(id, loggedUser, userType, file);
  }
}
