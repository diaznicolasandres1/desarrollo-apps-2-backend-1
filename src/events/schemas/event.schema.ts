import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'CulturalPlace', required: true })
  culturalPlaceId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({
    type: [{
      type: {
        type: String,
        enum: ['general', 'vip', 'jubilados', 'niños'],
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      initialQuantity: {
        type: Number,
        required: true,
        min: 1
      },
      soldQuantity: {
        type: Number,
        default: 0,
        min: 0
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    required: true,
    validate: {
      validator: function(ticketTypes: any[]) {
        return ticketTypes.length > 0;
      },
      message: 'At least one ticket type is required'
    }
  })
  ticketTypes: Array<{
    type: string;
    price: number;
    initialQuantity: number;
    soldQuantity: number;
    isActive: boolean;
  }>;

  @Prop({ default: true })
  isActive: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes for efficient queries
EventSchema.index({ culturalPlaceId: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ culturalPlaceId: 1, date: 1 });
EventSchema.index({ isActive: 1 });
EventSchema.index({ date: 1, isActive: 1 });

// Virtual for available quantity
EventSchema.virtual('availableQuantity').get(function() {
  if (!this.ticketTypes || !Array.isArray(this.ticketTypes)) {
    return 0;
  }
  return this.ticketTypes.reduce((total, ticketType) => {
    return total + (ticketType.initialQuantity - ticketType.soldQuantity);
  }, 0);
});

// Ensure virtuals are serialized
EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });
