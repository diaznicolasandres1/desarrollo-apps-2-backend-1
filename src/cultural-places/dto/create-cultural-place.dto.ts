import { IsString, IsArray, IsObject, IsNumber, IsBoolean, IsOptional, IsEmail, IsUrl, Min, Max, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleDto {
  @IsString()
  open: string;

  @IsString()
  close: string;

  @IsBoolean()
  closed: boolean;
}

export class CoordinatesDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class ContactDto {
  @IsString()
  address: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates: CoordinatesDto;

  @IsString()
  phone: string;

  @IsUrl()
  website: string;

  @IsEmail()
  email: string;
}

export class SchedulesDto {
  @ValidateNested()
  @Type(() => ScheduleDto)
  monday: ScheduleDto;

  @ValidateNested()
  @Type(() => ScheduleDto)
  tuesday: ScheduleDto;

  @ValidateNested()
  @Type(() => ScheduleDto)
  wednesday: ScheduleDto;

  @ValidateNested()
  @Type(() => ScheduleDto)
  thursday: ScheduleDto;

  @ValidateNested()
  @Type(() => ScheduleDto)
  friday: ScheduleDto;

  @ValidateNested()
  @Type(() => ScheduleDto)
  saturday: ScheduleDto;

  @ValidateNested()
  @Type(() => ScheduleDto)
  sunday: ScheduleDto;
}

export class CreateCulturalPlaceDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  characteristics?: string[];

  @ValidateNested()
  @Type(() => SchedulesDto)
  schedules: SchedulesDto;

  @ValidateNested()
  @Type(() => ContactDto)
  contact: ContactDto;

  @IsUrl()
  image: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
