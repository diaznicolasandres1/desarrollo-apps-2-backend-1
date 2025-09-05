import { PartialType } from '@nestjs/mapped-types';
import { CreateCulturalPlaceDto } from './create-cultural-place.dto';

export class UpdateCulturalPlaceDto extends PartialType(CreateCulturalPlaceDto) {}
