import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InsufficientTicketsException } from '../common/exceptions/insufficient-tickets.exception';
import type { TicketRepository } from './interfaces/ticket.repository.interface';
import { TICKET_REPOSITORY } from './interfaces/ticket.repository.token';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { PurchaseMultipleTicketsDto } from './dto/purchase-multiple-tickets.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './schemas/ticket.schema';
import { Types } from 'mongoose';
import { UserService } from '../users/user/user.service';
import { EmailService } from '../email/email.service';
import { EventInventoryService } from '../events/event-inventory.service';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @Inject(TICKET_REPOSITORY) private readonly repository: TicketRepository,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly eventInventoryService: EventInventoryService
  ) {}



  async purchaseTicket(purchaseTicketDto: PurchaseTicketDto): Promise<Ticket[]> {
    const { eventId, userId, ticketType, quantity = 1 } = purchaseTicketDto;

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      throw new BadRequestException('Quantity must be between 1 and 10');
    }

    // Validate event exists, is active, and not expired
    const event = await this.eventInventoryService.validateEventForTicketPurchase(eventId);

    // Check ticket availability
    const isAvailable = await this.eventInventoryService.checkTicketAvailability(eventId, ticketType, quantity);
    if (!isAvailable) {
      const availableQuantity = await this.eventInventoryService.getTicketAvailability(eventId, ticketType);
      throw new InsufficientTicketsException(eventId, ticketType, quantity, availableQuantity);
    }

    // Get ticket price from event
    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData) {
      throw new BadRequestException(`Ticket type ${ticketType} not available for this event`);
    }
    const ticketPrice = ticketTypeData.price;

    const tickets: Ticket[] = [];

    // Crear tickets (el QR se genera automáticamente en el pre-save hook)
    for (let i = 0; i < quantity; i++) {
      const ticketData: Partial<Ticket> = {
        eventId: new Types.ObjectId(eventId),
        userId: new Types.ObjectId(userId),
        ticketType,
        price: ticketPrice,
        status: 'active'
      };
      
      const ticket = await this.repository.create(ticketData);
      tickets.push(ticket);
    }

    // Update ticket count in event
    await this.eventInventoryService.updateTicketCount(eventId, ticketType, quantity);

    // Send confirmation email
    try {
      await this.sendTicketConfirmationEmail(tickets, event, userId);
    } catch (error) {
      this.logger.error('Error al enviar email de confirmación:', error);
      // No lanzamos el error para no interrumpir la compra si el email falla
    }

    return tickets;
  }

  async purchaseMultipleTickets(purchaseMultipleTicketsDto: PurchaseMultipleTicketsDto): Promise<Ticket[]> {
    const { tickets: ticketRequests } = purchaseMultipleTicketsDto;
    
    // Validate that we have at least one ticket request
    if (!ticketRequests || ticketRequests.length === 0) {
      throw new BadRequestException('At least one ticket must be specified');
    }

    // Validate total quantity across all requests (max 10 per purchase)
    const totalQuantity = ticketRequests.reduce((sum, req) => sum + req.quantity, 0);
    if (totalQuantity > 10) {
      throw new BadRequestException('Total quantity cannot exceed 10 tickets per purchase');
    }

    const allCreatedTickets: Ticket[] = [];
    let userId: string | null = null;

    // Process each ticket request
    for (const ticketRequest of ticketRequests) {
      const { eventId: currentEventId, userId: currentUserId, type: ticketType, quantity } = ticketRequest;

      // Set userId from first request (assuming all tickets are for same user)
      if (userId === null) userId = currentUserId;

      // Validate quantity for individual request
      if (quantity < 1 || quantity > 10) {
        throw new BadRequestException('Quantity must be between 1 and 10 for each ticket type');
      }

      // Validate event exists, is active, and not expired
      const event = await this.eventInventoryService.validateEventForTicketPurchase(currentEventId);

      // Check ticket availability
      const isAvailable = await this.eventInventoryService.checkTicketAvailability(currentEventId, ticketType, quantity);
      if (!isAvailable) {
        const availableQuantity = await this.eventInventoryService.getTicketAvailability(currentEventId, ticketType);
        throw new InsufficientTicketsException(currentEventId, ticketType, quantity, availableQuantity);
      }

      // Get ticket price from event
      const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
      if (!ticketTypeData) {
        throw new BadRequestException(`Ticket type ${ticketType} not available for this event`);
      }
      const ticketPrice = ticketTypeData.price;

      // Create tickets for this request
      for (let i = 0; i < quantity; i++) {
        const ticketData: Partial<Ticket> = {
          eventId: new Types.ObjectId(currentEventId),
          userId: new Types.ObjectId(currentUserId),
          ticketType,
          price: ticketPrice,
          status: 'active'
        };
        
        const ticket = await this.repository.create(ticketData);
        allCreatedTickets.push(ticket);
      }

      // Update ticket count in event
      await this.eventInventoryService.updateTicketCount(currentEventId, ticketType, quantity);
    }

    // Group tickets by event and send separate emails for each event
    try {
      const user = await this.userService.findOne(userId!);
      if (user) {
        await this.emailService.sendMultipleEventConfirmationEmails(
          allCreatedTickets,
          user.email,
          user.name,
          (eventId: string) => this.eventInventoryService.validateEventForTicketPurchase(eventId)
        );
      }
    } catch (error) {
      this.logger.error('Error al enviar emails de confirmación:', error);
      // No lanzamos el error para no interrumpir la compra si el email falla
    }

    return allCreatedTickets;
  }


  async findAll(query?: any): Promise<Ticket[]> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async findByEvent(eventId: string): Promise<Ticket[]> {
    return this.repository.findByEvent(eventId);
  }

  async findByUser(userId: string, options?: any): Promise<Ticket[]> {
    return this.repository.findByUser(userId, options);
  }

  async findByUserWithEventDetails(userId: string): Promise<any[]> {
    const tickets = await this.repository.findByUser(userId, {
      populate: [
        {
          path: 'eventId',
          select: '_id name description date time image',
          populate: {
            path: 'culturalPlaceId',
            select: '_id name contact.address image'
          }
        }
      ]
    });
    
    return tickets.map(ticket => {
      const ticketObj = (ticket as any).toObject ? (ticket as any).toObject() : ticket;
      
      // Transformar la estructura para que coincida con lo que espera el frontend
      return {
        _id: ticketObj._id,
        eventId: {
          _id: ticketObj.eventId._id,
          name: ticketObj.eventId.name,
          description: ticketObj.eventId.description,
          date: ticketObj.eventId.date,
          time: ticketObj.eventId.time,
          image: ticketObj.eventId.image, 
          culturalPlaceId: {
            _id: ticketObj.eventId.culturalPlaceId._id,
            name: ticketObj.eventId.culturalPlaceId.name,
            address: ticketObj.eventId.culturalPlaceId.contact.address,
            image: ticketObj.eventId.culturalPlaceId.image
          }
        },
        userId: ticketObj.userId,
        ticketType: ticketObj.ticketType,
        price: ticketObj.price,
        status: ticketObj.status,
        purchaseDate: ticketObj.createdAt, // Usar createdAt como purchaseDate
        qrCode: ticketObj.qrCode,
        isActive: ticketObj.isActive
      };
    });
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<Ticket[]> {
    return this.repository.findByEventAndUser(eventId, userId);
  }

  async findByStatus(status: string): Promise<Ticket[]> {
    return this.repository.findByStatus(status);
  }

  async findActiveTickets(): Promise<Ticket[]> {
    return this.repository.findActiveTickets();
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updateData: any = {
      ...updateTicketDto,
      ...(updateTicketDto.eventId && { eventId: new Types.ObjectId(updateTicketDto.eventId) }),
      ...(updateTicketDto.userId && { userId: new Types.ObjectId(updateTicketDto.userId) })
    };

    const updatedTicket = await this.repository.update(id, updateData);
    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async markAsUsed(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'active') {
      throw new BadRequestException('Ticket is not active');
    }

    const updatedTicket = await this.repository.markAsUsed(id);
    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async cancelTicket(id: string, reason?: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'active') {
      throw new BadRequestException('Ticket is not active');
    }

    const updatedTicket = await this.repository.cancelTicket(id, reason);
    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Ticket not found');
    }
  }

  async getTicketStats(eventId: string): Promise<any> {
    const tickets = await this.repository.findByEvent(eventId);
    
    // Calculate revenue
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const activeRevenue = tickets
      .filter(t => t.status === 'active')
      .reduce((sum, ticket) => sum + ticket.price, 0);
    
    // Group by ticket type with detailed stats
    const ticketTypeStats = {};
    const ticketTypes = ['general', 'vip', 'jubilados', 'niños'];
    
    ticketTypes.forEach(type => {
      const typeTickets = tickets.filter(t => t.ticketType === type);
      ticketTypeStats[type] = {
        sold: typeTickets.length,
        revenue: typeTickets.reduce((sum, ticket) => sum + ticket.price, 0),
        active: typeTickets.filter(t => t.status === 'active').length,
        used: typeTickets.filter(t => t.status === 'used').length,
        cancelled: typeTickets.filter(t => t.status === 'cancelled').length
      };
    });
    
    const stats = {
      eventId,
      totalTicketsSold: tickets.length,
      totalRevenue,
      activeRevenue,
      ticketTypeStats,
      statusBreakdown: {
        active: tickets.filter(t => t.status === 'active').length,
        used: tickets.filter(t => t.status === 'used').length,
        cancelled: tickets.filter(t => t.status === 'cancelled').length,
      },
      averageTicketPrice: tickets.length > 0 ? totalRevenue / tickets.length : 0
    };

    return stats;
  }

  private async sendTicketConfirmationEmail(
    tickets: Ticket[],
    event: any,
    userId: string
  ): Promise<void> {
    try {
      // Obtener datos del usuario
      const user = await this.userService.findOne(userId);
      if (!user) {
        this.logger.warn(`Usuario no encontrado para ID: ${userId}`);
        return;
      }

      // Calcular el total
      const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

      // Preparar datos para el email
      const emailData = {
        userEmail: user.email,
        userName: user.name,
        event: event,
        tickets: tickets,
        totalAmount: totalAmount,
      };

      // Enviar email
      const emailSent = await this.emailService.sendTicketConfirmationEmail(emailData);
      
      if (emailSent) {
        this.logger.log(`Email de confirmación enviado exitosamente a ${user.email}`);
      } else {
        this.logger.warn(`Error al enviar email de confirmación a ${user.email}`);
      }
    } catch (error) {
      this.logger.error('Error en sendTicketConfirmationEmail:', error);
      throw error;
    }
  }


  async getUsersWithActiveTicketsForEvent(eventId: string): Promise<Array<{
    userId: string;
    userEmail: string;
    userName: string;
    ticketCount: number;
    ticketTypes: string[];
  }>> {
    try {
      // Convertir eventId a ObjectId para la consulta MongoDB
      const eventObjectId = new Types.ObjectId(eventId);
      const tickets = await this.repository.findByEvent(eventObjectId.toString());
      const activeTickets = tickets.filter(ticket => ticket.status === 'active');

      if (activeTickets.length === 0) {
        this.logger.log(`No hay tickets activos para el evento ${eventId}`);
        return [];
      }

      const userTicketMap = new Map();
      for (const ticket of activeTickets) {
        const userId = ticket.userId.toString();
        if (!userTicketMap.has(userId)) {
          const user = await this.userService.findOne(userId);
          if (!user) {
            this.logger.warn(`Usuario no encontrado para ID: ${userId}`);
            continue;
          }
          userTicketMap.set(userId, {
            userId,
            userEmail: user.email,
            userName: user.name,
            ticketCount: 0,
            ticketTypes: new Set()
          });
        }
        const userData = userTicketMap.get(userId);
        userData.ticketCount++;
        userData.ticketTypes.add(ticket.ticketType);
      }

      const result = Array.from(userTicketMap.values()).map(userData => ({
        ...userData,
        ticketTypes: Array.from(userData.ticketTypes)
      }));

      this.logger.log(`Encontrados ${result.length} usuarios con tickets activos para el evento ${eventId}`);
      return result;
    } catch (error) {
      this.logger.error('Error obteniendo usuarios con tickets activos:', error);
      return [];
    }
  }
}
