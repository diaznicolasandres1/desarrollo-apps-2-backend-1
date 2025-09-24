import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop()
  age?: number;

  @Prop({ required: false })
  isGoogleUser: boolean;

  @Prop({ 
    type: String, 
    default: 'user',
    required: true 
  })
  role: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Transform dates to add 4 hours for timezone compensation
UserSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret: any) {
    // Add 4 hours to createdAt
    if (ret.createdAt) {
      ret.createdAt = new Date(new Date(ret.createdAt).getTime() + 4 * 60 * 60 * 1000);
    }
    return ret;
  }
});

UserSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret: any) {
    // Add 4 hours to createdAt
    if (ret.createdAt) {
      ret.createdAt = new Date(new Date(ret.createdAt).getTime() + 4 * 60 * 60 * 1000);
    }
    return ret;
  }
});
