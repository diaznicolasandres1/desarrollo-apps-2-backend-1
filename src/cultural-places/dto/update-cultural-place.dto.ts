import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCulturalPlaceDto } from './create-cultural-place.dto';

export class UpdateCulturalPlaceDto extends PartialType(OmitType(CreateCulturalPlaceDto, ['color'] as const)) {}
