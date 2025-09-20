import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { PurchaseMultipleTicketsDto } from './dto/purchase-multiple-tickets.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService
  ) {}

  @Post('purchase')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Purchase multiple tickets for different events and types',
    description: 'Purchase multiple tickets of different types in a single transaction. Supports general, vip, jubilados, and niños ticket types. Maximum 10 tickets per transaction.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Tickets purchased successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '68cf25ed3435733e4a34db91' },
          eventId: { type: 'string', example: '68cb3f47a7999cce8e8e8079' },
          userId: { type: 'string', example: '68c2dd60fb172823da61eb92' },
          ticketType: { type: 'string', example: 'general' },
          price: { type: 'number', example: 1500 },
          status: { type: 'string', example: 'active' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          validationURL: { type: 'string', example: 'https://desarrollo-apps-2-frontend.vercel.app/ticket_id/68cf25ed3435733e4a34db91/use' },
          qrCode: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6e...' }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or insufficient tickets' })
  @ApiResponse({ status: 404, description: 'Event or user not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async purchaseMultipleTickets(@Body() purchaseMultipleTicketsDto: PurchaseMultipleTicketsDto) {
    return this.ticketsService.purchaseMultipleTickets(purchaseMultipleTicketsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tickets with optional filtering' })
  @ApiQuery({ name: 'eventId', required: false, description: 'Filter by event ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by ticket status' })
  @ApiQuery({ name: 'ticketType', required: false, description: 'Filter by ticket type' })
  @ApiResponse({ status: 200, description: 'List of tickets retrieved successfully' })
  async findAll(@Query() query: any) {
    return this.ticketsService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active tickets' })
  @ApiResponse({ status: 200, description: 'List of active tickets retrieved successfully' })
  async findActiveTickets() {
    return this.ticketsService.findActiveTickets();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get tickets by event ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'List of tickets for event retrieved successfully' })
  async findByEvent(@Param('eventId') eventId: string) {
    return this.ticketsService.findByEvent(eventId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get tickets by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of tickets for user retrieved successfully' })
  async findByUser(@Param('userId') userId: string) {
    return this.ticketsService.findByUser(userId);
  }

  @Get('event/:eventId/user/:userId')
  @ApiOperation({ summary: 'Get tickets by event and user ID' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of tickets for event and user retrieved successfully' })
  async findByEventAndUser(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    return this.ticketsService.findByEventAndUser(eventId, userId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get tickets by status' })
  @ApiParam({ name: 'status', description: 'Ticket status (active, used, cancelled)' })
  @ApiResponse({ status: 200, description: 'List of tickets by status retrieved successfully' })
  async findByStatus(@Param('status') status: string) {
    return this.ticketsService.findByStatus(status);
  }

  @Get('event/:eventId/stats')
  @ApiOperation({ summary: 'Get ticket statistics for an event' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Ticket statistics retrieved successfully' })
  async getTicketStats(@Param('eventId') eventId: string) {
    return this.ticketsService.getTicketStats(eventId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Patch(':id/use')
  @ApiOperation({ summary: 'Mark a ticket as used' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket marked as used successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 400, description: 'Bad request - ticket is not active' })
  async markAsUsed(@Param('id') id: string) {
    return this.ticketsService.markAsUsed(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({ status: 400, description: 'Bad request - ticket is not active' })
  async cancelTicket(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.ticketsService.cancelTicket(id, body.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 204, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async remove(@Param('id') id: string) {
    await this.ticketsService.remove(id);
  }

}
