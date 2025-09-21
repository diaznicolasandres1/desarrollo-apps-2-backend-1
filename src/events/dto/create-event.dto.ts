import { IsString, IsArray, IsNumber, IsBoolean, IsOptional, IsDateString, Min, Max, ValidateNested, ArrayMinSize, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TicketTypeDto {
  @ApiProperty({ example: 'general', enum: ['general', 'vip', 'jubilados', 'niños'], description: 'Type of ticket' })
  @IsString()
  type: string;

  @ApiProperty({ example: 1000, minimum: 0, description: 'Price of the ticket' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, minimum: 1, description: 'Initial quantity available' })
  @IsNumber()
  @Min(1)
  initialQuantity: number;

  @ApiProperty({ example: true, description: 'Whether this ticket type is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateEventDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID of the cultural place' })
  @IsMongoId()
  culturalPlaceId: string;

  @ApiProperty({ example: 'Exposición de Arte Contemporáneo', description: 'Name of the event' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Una muestra de artistas locales con obras contemporáneas', description: 'Description of the event' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2024-03-15', description: 'Date of the event' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '19:00', description: 'Time of the event' })
  @IsString()
  time: string;

  @ApiProperty({ 
    type: [String],
    example: ['https://example.com/event-image1.jpg', 'https://example.com/event-image2.jpg'], 
    description: 'Array of images for the event (URLs, base64, or any string format)'
  })
  @IsArray()
  @IsString({ each: true })
  image: string[];

  @ApiProperty({ type: [TicketTypeDto], description: 'Available ticket types', minimum: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketTypeDto)
  ticketTypes: TicketTypeDto[];

  @ApiProperty({ example: true, description: 'Whether the event is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
