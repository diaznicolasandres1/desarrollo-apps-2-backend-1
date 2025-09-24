import { IsString, IsEnum, IsOptional, IsMongoId, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTicketDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'Event ID', required: false })
  @IsOptional()
  @IsMongoId()
  eventId?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', description: 'User ID', required: false })
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @ApiProperty({ example: 'general', description: 'Type of ticket', required: false })
  @IsOptional()
  @IsString()
  ticketType?: string;

  @ApiProperty({ example: 1000, minimum: 0, description: 'Ticket price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 'used', enum: ['active', 'used', 'cancelled'], description: 'Ticket status', required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['active', 'used', 'cancelled'])
  status?: string;

  @ApiProperty({ example: 'Event cancelled', description: 'Cancellation reason', required: false })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
