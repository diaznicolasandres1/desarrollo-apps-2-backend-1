import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  ticketType: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({
    required: true,
    enum: ['active', 'used', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Date })
  usedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  qrCode?: string;

  @Prop({ required: false })
  validationURL?: string;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// Pre-save hook para generar QR automáticamente
TicketSchema.pre('save', async function (next) {
  // Solo generar QR si no existe y es un documento nuevo
  if (this.isNew && !this.qrCode) {
    try {
      const QRCode = require('qrcode');
      const ticketId = this._id.toString();
      const validationURL = `https://cultura.tomasschuster.com/ticket/${ticketId}/use`;

      this.validationURL = validationURL;
      this.qrCode = await QRCode.toDataURL(validationURL, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      console.error('Error generando QR en pre-save hook:', error);
      // No fallar la creación del ticket si hay error con el QR
    }
  }
  next();
});

// Indexes for efficient queries
TicketSchema.index({ eventId: 1 });
TicketSchema.index({ userId: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ eventId: 1, status: 1 });
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ createdAt: 1 });

// Compound index for user's event tickets
TicketSchema.index({ userId: 1, eventId: 1 });

// Transform dates to add 4 hours for timezone compensation
TicketSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret: any) {
    // Add 4 hours to date fields
    if (ret.usedAt) {
      ret.usedAt = new Date(new Date(ret.usedAt).getTime() + 4 * 60 * 60 * 1000);
    }
    if (ret.cancelledAt) {
      ret.cancelledAt = new Date(new Date(ret.cancelledAt).getTime() + 4 * 60 * 60 * 1000);
    }
    if (ret.createdAt) {
      ret.createdAt = new Date(new Date(ret.createdAt).getTime() + 4 * 60 * 60 * 1000);
    }
    if (ret.updatedAt) {
      ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() + 4 * 60 * 60 * 1000);
    }
    return ret;
  }
});

TicketSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret: any) {
    // Add 4 hours to date fields
    if (ret.usedAt) {
      ret.usedAt = new Date(new Date(ret.usedAt).getTime() + 4 * 60 * 60 * 1000);
    }
    if (ret.cancelledAt) {
      ret.cancelledAt = new Date(new Date(ret.cancelledAt).getTime() + 4 * 60 * 60 * 1000);
    }
    if (ret.createdAt) {
      ret.createdAt = new Date(new Date(ret.createdAt).getTime() + 4 * 60 * 60 * 1000);
    }
    if (ret.updatedAt) {
      ret.updatedAt = new Date(new Date(ret.updatedAt).getTime() + 4 * 60 * 60 * 1000);
    }
    return ret;
  }
});
