import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['general', 'vip', 'jubilados', 'niños'] })
  ticketType: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, enum: ['active', 'used', 'cancelled'], default: 'active' })
  status: string;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Indexes for efficient queries
TicketSchema.index({ eventId: 1 });
TicketSchema.index({ userId: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ eventId: 1, status: 1 });
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ createdAt: 1 });

// Compound index for user's event tickets
TicketSchema.index({ userId: 1, eventId: 1 });
