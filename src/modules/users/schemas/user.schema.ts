import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ unique: true })
  phone: string;

  @Prop()
  otpCode?: string;

  @Prop()
  otpExpires?: Date;

  @Prop()
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
