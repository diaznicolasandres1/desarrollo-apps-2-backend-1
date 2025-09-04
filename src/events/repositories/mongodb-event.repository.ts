import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { EventRepository } from '../interfaces/event.repository.interface';
import { EventWithCulturalPlace } from '../interfaces/event-with-cultural-place.interface';

@Injectable()
export class MongoDBEventRepository implements EventRepository {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(event: Partial<Event>): Promise<Event> {
    const createdEvent = new this.eventModel(event);
    return createdEvent.save();
  }

  async findAll(query?: any): Promise<any[]> {
    const filter: any = {};
    
    if (query?.culturalPlaceId) {
      filter.culturalPlaceId = new Types.ObjectId(query.culturalPlaceId);
    }
    
    if (query?.isActive !== undefined) {
      filter.isActive = query.isActive;
    }
    
    if (query?.startDate && query?.endDate) {
      filter.date = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    }

    return this.eventModel
      .find(filter)
      .populate('culturalPlaceId', 'name description category characteristics contact image rating')
      .sort({ date: 1 })
      .exec();
  }

  async findById(id: string): Promise<any> {
    return this.eventModel
      .findById(id)
      .populate('culturalPlaceId', 'name description category characteristics contact image rating')
      .exec();
  }

  async findByCulturalPlace(culturalPlaceId: string): Promise<any[]> {
    return this.eventModel
      .find({ culturalPlaceId: new Types.ObjectId(culturalPlaceId) })
      .populate('culturalPlaceId', 'name description category characteristics contact image rating')
      .sort({ date: 1 })
      .exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return this.eventModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        },
        isActive: true
      })
      .populate('culturalPlaceId', 'name description category characteristics contact image rating')
      .sort({ date: 1 })
      .exec();
  }

  async findActiveEvents(): Promise<any[]> {
    return this.eventModel
      .find({ isActive: true })
      .populate('culturalPlaceId', 'name description category characteristics contact image rating')
      .sort({ date: 1 })
      .exec();
  }

  async update(id: string, event: Partial<Event>): Promise<Event | null> {
    return this.eventModel
      .findByIdAndUpdate(id, event, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.eventModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async toggleActive(id: string): Promise<Event | null> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) return null;
    
    event.isActive = !event.isActive;
    return event.save();
  }

  async updateTicketCount(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    try {
      const result = await this.eventModel.updateOne(
        { 
          _id: new Types.ObjectId(eventId),
          'ticketTypes.type': ticketType,
          'ticketTypes.isActive': true
        },
        { 
          $inc: { 'ticketTypes.$.soldQuantity': quantity }
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating ticket count:', error);
      return false;
    }
  }
}
