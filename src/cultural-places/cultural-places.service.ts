import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { CULTURAL_PLACE_REPOSITORY } from './interfaces/cultural-place.repository.interface';
import type { ICulturalPlaceRepository } from './interfaces/cultural-place.repository.interface';
import { CreateCulturalPlaceDto } from './dto/create-cultural-place.dto';
import { UpdateCulturalPlaceDto } from './dto/update-cultural-place.dto';
import { CulturalPlaceQueryDto } from './interfaces/cultural-place.interface';
import { CulturalPlace } from './schemas/cultural-place.schema';

@Injectable()
export class CulturalPlacesService {
  constructor(
    @Inject(CULTURAL_PLACE_REPOSITORY)
    private readonly culturalPlaceRepository: ICulturalPlaceRepository,
  ) {}

  async create(createCulturalPlaceDto: CreateCulturalPlaceDto): Promise<CulturalPlace> {
    try {
      const existingPlace = await this.culturalPlaceRepository.findByName(createCulturalPlaceDto.name);

      if (existingPlace) {
        throw new ConflictException('A cultural place with this name already exists');
      }

      if (createCulturalPlaceDto.contact?.coordinates) {
        this.validateCoordinates(createCulturalPlaceDto.contact.coordinates);
      }

      this.validateSchedules(createCulturalPlaceDto.schedules);

      return await this.culturalPlaceRepository.create(createCulturalPlaceDto);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error creating cultural place');
    }
  }

  async findAll(query: CulturalPlaceQueryDto = {}): Promise<CulturalPlace[]> {
    const places = await this.culturalPlaceRepository.findAll(query);
    return places.map(place => this.addRandomColor(place));
  }

  async findOne(id: string): Promise<CulturalPlace> {
    const place = await this.culturalPlaceRepository.findById(id);
    
    if (!place) {
      throw new NotFoundException('Cultural place not found');
    }

    return this.addRandomColor(place);
  }

  async update(id: string, updateCulturalPlaceDto: UpdateCulturalPlaceDto): Promise<CulturalPlace> {
    try {
      const existingPlace = await this.findOne(id);

      if (updateCulturalPlaceDto.name && updateCulturalPlaceDto.name !== existingPlace.name) {
        const duplicateName = await this.culturalPlaceRepository.findByName(updateCulturalPlaceDto.name);

        if (duplicateName) {
          throw new ConflictException('A cultural place with this name already exists');
        }
      }

      if (updateCulturalPlaceDto.contact?.coordinates) {
        this.validateCoordinates(updateCulturalPlaceDto.contact.coordinates);
      }

      if (updateCulturalPlaceDto.schedules) {
        this.validateSchedules(updateCulturalPlaceDto.schedules);
      }

      const updatedPlace = await this.culturalPlaceRepository.update(id, updateCulturalPlaceDto);

      if (!updatedPlace) {
        throw new NotFoundException('Cultural place not found');
      }

      return this.addRandomColor(updatedPlace);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error updating cultural place');
    }
  }

  async toggleActive(id: string): Promise<CulturalPlace> {
    const place = await this.findOne(id);
    
    const updatedPlace = await this.culturalPlaceRepository.update(id, {
      isActive: !place.isActive,
    });

    if (!updatedPlace) {
      throw new NotFoundException('Error updating place status');
    }

    return this.addRandomColor(updatedPlace);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    const success = await this.culturalPlaceRepository.delete(id);
    
    if (!success) {
      throw new NotFoundException('Error deleting cultural place');
    }
  }

  async findByCategory(category: string): Promise<CulturalPlace[]> {
    const places = await this.culturalPlaceRepository.findByCategory(category);
    return places.map(place => this.addRandomColor(place));
  }

  async findOpenPlaces(dayOfWeek: string): Promise<CulturalPlace[]> {
    const places = await this.culturalPlaceRepository.findOpenPlaces(dayOfWeek);
    return places.map(place => this.addRandomColor(place));
  }

  async findTopRated(limit: number = 10): Promise<CulturalPlace[]> {
    const places = await this.culturalPlaceRepository.findTopRated(limit);
    return places.map(place => this.addRandomColor(place));
  }

  private validateCoordinates(coordinates: { lat: number; lng: number }): void {
    if (coordinates.lat < -90 || coordinates.lat > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }
    
    if (coordinates.lng < -180 || coordinates.lng > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }
  }

  private validateSchedules(schedules: any): void {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const schedule = schedules[day];
      
      if (!schedule) {
        throw new BadRequestException(`Schedule for ${day} is required`);
      }

      if (!schedule.closed) {
        if (!schedule.open || !schedule.close) {
          throw new BadRequestException(`Opening and closing hours are required for ${day}`);
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(schedule.open) || !timeRegex.test(schedule.close)) {
          throw new BadRequestException(`Invalid time format for ${day}. Use HH:MM`);
        }
      }
    }
  }

  private addRandomColor(place: CulturalPlace): CulturalPlace {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#A9DFBF', '#F9E79F', '#D5A6BD', '#A3E4D7', '#FADBD8'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      ...place,
      color: randomColor
    } as CulturalPlace;
  }
}
