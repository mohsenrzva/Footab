import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Otp extends Document {
  @Prop({ unique: true })
  phone: string;

  @Prop()
  code: string;

  @Prop()
  expires: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
