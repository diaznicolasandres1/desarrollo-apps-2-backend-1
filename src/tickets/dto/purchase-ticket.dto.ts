import { IsString, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseTicketDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Event ID' })
  @IsMongoId()
  eventId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'User ID' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: 'general', description: 'Type of ticket to purchase' })
  @IsString()
  ticketType: string;

  @ApiProperty({ example: 1, minimum: 1, description: 'Quantity of tickets to purchase', required: false })
  @IsOptional()
  quantity?: number = 1;
}
