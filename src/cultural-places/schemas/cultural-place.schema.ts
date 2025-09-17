import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CulturalPlaceDocument = CulturalPlace & Document;

@Schema({ timestamps: true })
export class CulturalPlace {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, enum: ['Museum', 'Cinema', 'Cultural Center', 'Theater', 'Gallery', 'Library', 'Auditorium'] })
  category: string;

  @Prop({ type: [String], default: [] })
  characteristics: string[];

  @Prop({
    type: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean }
    },
    required: true
  })
  schedules: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };

  @Prop({
    type: {
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
      phone: String,
      website: String,
      email: String
    },
    required: true
  })
  contact: {
    address: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
    phone: string;
    website: string;
    email: string;
  };

  @Prop({ required: true })
  image: string;

  @Prop({ 
    required: true, 
    min: 0, 
    max: 5, 
    default: 0 
  })
  rating: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  color: string;
}

export const CulturalPlaceSchema = SchemaFactory.createForClass(CulturalPlace);

CulturalPlaceSchema.index({ category: 1 });
CulturalPlaceSchema.index({ 'contact.coordinates': '2dsphere' });
CulturalPlaceSchema.index({ name: 'text' });
CulturalPlaceSchema.index({ rating: -1 });
CulturalPlaceSchema.index({ isActive: 1 });
