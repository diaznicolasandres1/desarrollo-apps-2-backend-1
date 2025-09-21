import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketDocument } from '../schemas/ticket.schema';
import { TicketRepository } from '../interfaces/ticket.repository.interface';

@Injectable()
export class MongoDBTicketRepository implements TicketRepository {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
  ) {}

  async create(ticket: Partial<Ticket>): Promise<Ticket> {
    const createdTicket = new this.ticketModel(ticket);
    return createdTicket.save();
  }

  async findAll(query?: any): Promise<Ticket[]> {
    const filter: any = {};

    if (query?.eventId) {
      filter.eventId = new Types.ObjectId(query.eventId);
    }

    if (query?.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.ticketType) {
      filter.ticketType = query.ticketType;
    }

    if (query?.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    return this.ticketModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketModel.findById(id).exec();
  }

  async findByEvent(eventId: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string, options?: any): Promise<Ticket[]> {
    const query = this.ticketModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    if (options?.populate) {
      // Aplicar populate para eventId y culturalPlaceId anidado
      query.populate({
        path: 'eventId',
        select: '_id name description date time image',
        populate: {
          path: 'culturalPlaceId',
          select: '_id name contact.address contact.image'
        }
      });
    }

    return query.exec();
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({
        eventId: new Types.ObjectId(eventId),
        userId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStatus(status: string): Promise<Ticket[]> {
    return this.ticketModel
      .find({ status })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActiveTickets(): Promise<Ticket[]> {
    return this.ticketModel
      .find({ status: 'active', isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket | null> {
    return this.ticketModel
      .findByIdAndUpdate(id, ticket, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ticketModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async markAsUsed(id: string): Promise<Ticket | null> {
    return this.ticketModel
      .findByIdAndUpdate(
        id,
        { 
          status: 'used',
          usedAt: new Date()
        },
        { new: true }
      )
      .exec();
  }

  async cancelTicket(id: string, reason?: string): Promise<Ticket | null> {
    return this.ticketModel
      .findByIdAndUpdate(
        id,
        { 
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: reason
        },
        { new: true }
      )
      .exec();
  }

  async countByEventAndType(eventId: string, ticketType: string): Promise<number> {
    return this.ticketModel
      .countDocuments({
        eventId: new Types.ObjectId(eventId),
        ticketType,
        status: 'active'
      })
      .exec();
  }
}
