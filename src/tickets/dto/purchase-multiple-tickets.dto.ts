import { IsString, IsMongoId, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TicketPurchaseItemDto {
  @ApiProperty({ 
    example: '68cb3f47a7999cce8e8e8079', 
    description: 'MongoDB ObjectId of the event',
    type: 'string'
  })
  @IsMongoId()
  eventId: string;

  @ApiProperty({ 
    example: '68c2dd60fb172823da61eb92', 
    description: 'MongoDB ObjectId of the user purchasing the tickets',
    type: 'string'
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({ 
    example: 'general', 
    enum: ['general', 'vip', 'jubilados', 'niños'], 
    description: 'Type of ticket to purchase. Available types: general, vip, jubilados, niños',
    type: 'string'
  })
  @IsString()
  @IsEnum(['general', 'vip', 'jubilados', 'niños'])
  type: string;

  @ApiProperty({ 
    example: 2, 
    minimum: 1, 
    maximum: 10,
    description: 'Quantity of tickets to purchase (1-10 per ticket type)',
    type: 'number'
  })
  @IsNumber()
  quantity: number;
}

export class PurchaseMultipleTicketsDto {
  @ApiProperty({ 
    type: [TicketPurchaseItemDto], 
    description: 'Array of ticket purchases. Maximum 10 tickets total per transaction.',
    example: [
      {
        eventId: '68cb3f47a7999cce8e8e8079',
        userId: '68c2dd60fb172823da61eb92',
        type: 'general',
        quantity: 3
      },
      {
        eventId: '68cb3f47a7999cce8e8e8079',
        userId: '68c2dd60fb172823da61eb92',
        type: 'jubilados',
        quantity: 2
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketPurchaseItemDto)
  tickets: TicketPurchaseItemDto[];
}
