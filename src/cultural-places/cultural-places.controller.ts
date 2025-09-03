import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags} from '@nestjs/swagger';
import { CulturalPlacesService } from './cultural-places.service';
import { CreateCulturalPlaceDto } from './dto/create-cultural-place.dto';
import { UpdateCulturalPlaceDto } from './dto/update-cultural-place.dto';
import type { CulturalPlaceQueryDto } from './interfaces/cultural-place.interface';

@ApiTags('cultural-places')
@Controller('cultural-places')
export class CulturalPlacesController {
  constructor(private readonly culturalPlacesService: CulturalPlacesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCulturalPlaceDto: CreateCulturalPlaceDto) {
    return this.culturalPlacesService.create(createCulturalPlaceDto);
  }

  @Get()
  async findAll(@Query() query: CulturalPlaceQueryDto) {
    return this.culturalPlacesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.culturalPlacesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCulturalPlaceDto: UpdateCulturalPlaceDto,
  ) {
    return this.culturalPlacesService.update(id, updateCulturalPlaceDto);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.culturalPlacesService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.culturalPlacesService.remove(id);
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    return this.culturalPlacesService.findByCategory(category);
  }

  @Get('open/:day')
  async findOpenPlaces(@Param('day') day: string) {
    return this.culturalPlacesService.findOpenPlaces(day);
  }

  @Get('top-rated')
  async findTopRated(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.culturalPlacesService.findTopRated(limitNumber);
  }

  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius: string,
  ) {
    const query: CulturalPlaceQueryDto = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseFloat(radius),
    };
    
    return this.culturalPlacesService.findAll(query);
  }
}
