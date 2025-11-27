import { Body, Controller, Get, Param, Post, Delete, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoritesDto } from './dto/create-favorites.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createFavoritesDto: CreateFavoritesDto) {
        return this.favoritesService.create(createFavoritesDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.favoritesService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.favoritesService.findById(id);
    }

    @Get('/customer/:customerId')
    @UseGuards(AuthGuard('jwt'))
    async findByCustomerFavorites(@Param('customerId', ParseIntPipe) customerId: number) {
        return this.favoritesService.findByCustomerFavorites(customerId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async deleteById(@Param('id', ParseIntPipe) id: number) {
        return this.favoritesService.deleteById(id);
    }
}