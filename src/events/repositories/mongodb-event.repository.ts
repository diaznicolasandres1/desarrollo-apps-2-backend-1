import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../schemas/event.schema';
import { EventRepository } from '../interfaces/event.repository.interface';

@Injectable()
export class MongoDBEventRepository implements EventRepository {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(event: Partial<Event>): Promise<Event> {
    const createdEvent = new this.eventModel(event);
    return createdEvent.save();
  }

  async findAll(query?: any): Promise<Event[]> {
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

    return this.eventModel.find(filter).sort({ date: 1 }).exec();
  }

  async findById(id: string): Promise<Event | null> {
    return this.eventModel.findById(id).exec();
  }

  async findByCulturalPlace(culturalPlaceId: string): Promise<Event[]> {
    return this.eventModel
      .find({ culturalPlaceId: new Types.ObjectId(culturalPlaceId) })
      .sort({ date: 1 })
      .exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.eventModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        },
        isActive: true
      })
      .sort({ date: 1 })
      .exec();
  }

  async findActiveEvents(): Promise<Event[]> {
    return this.eventModel
      .find({ isActive: true })
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
}
