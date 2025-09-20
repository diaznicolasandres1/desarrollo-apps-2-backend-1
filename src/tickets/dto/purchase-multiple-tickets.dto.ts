import { IsString, IsMongoId, IsEnum, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TicketPurchaseItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Event ID' })
  @IsMongoId()
  eventId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'User ID' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: 'general', enum: ['general', 'vip', 'jubilados', 'niños'], description: 'Type of ticket to purchase' })
  @IsString()
  @IsEnum(['general', 'vip', 'jubilados', 'niños'])
  type: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Quantity of tickets to purchase' })
  @IsNumber()
  quantity: number;
}

export class PurchaseMultipleTicketsDto {
  @ApiProperty({ 
    type: [TicketPurchaseItemDto], 
    description: 'Array of ticket purchases',
    example: [
      {
        eventId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        type: 'general',
        quantity: 2
      },
      {
        eventId: '507f1f77bcf86cd799439011',
        userId: '507f1f77bcf86cd799439012',
        type: 'jubilados',
        quantity: 1
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketPurchaseItemDto)
  tickets: TicketPurchaseItemDto[];
}
