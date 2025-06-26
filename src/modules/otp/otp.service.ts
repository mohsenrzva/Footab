import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './schemas/otp.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<Otp>) {}

  saveOtp(phone: string, code: string, expires: Date) {
    return this.otpModel
      .findOneAndUpdate(
        { phone },
        { phone, code, expires },
        { upsert: true, new: true }
      )
      .exec();
  }

  findOtp(phone: string) {
    return this.otpModel.findOne({ phone }).exec();
  }

  clearOtp(phone: string) {
    return this.otpModel.deleteOne({ phone }).exec();
  }
}
