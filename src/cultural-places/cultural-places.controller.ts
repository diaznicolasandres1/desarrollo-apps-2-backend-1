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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new cultural place' })
  @ApiResponse({ status: 201, description: 'Cultural place created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'Conflict - place with same name already exists' })
  async create(@Body() createCulturalPlaceDto: CreateCulturalPlaceDto) {
    try {
      console.log('Controller received data:', JSON.stringify(createCulturalPlaceDto, null, 2));
      return await this.culturalPlacesService.create(createCulturalPlaceDto);
    } catch (error) {
      console.error('Controller error:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all cultural places with optional filtering' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'minRating', required: false, description: 'Minimum rating filter' })
  @ApiQuery({ name: 'maxRating', required: false, description: 'Maximum rating filter' })
  @ApiResponse({ status: 200, description: 'List of cultural places retrieved successfully' })
  async findAll(@Query() query: CulturalPlaceQueryDto) {
    return this.culturalPlacesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cultural place by ID' })
  @ApiParam({ name: 'id', description: 'Cultural place ID' })
  @ApiResponse({ status: 200, description: 'Cultural place retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Cultural place not found' })
  async findOne(@Param('id') id: string) {
    return this.culturalPlacesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a cultural place' })
  @ApiParam({ name: 'id', description: 'Cultural place ID' })
  @ApiResponse({ status: 200, description: 'Cultural place updated successfully' })
  @ApiResponse({ status: 404, description: 'Cultural place not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
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
