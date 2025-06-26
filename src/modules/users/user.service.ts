import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(phone: string) {
    return this.userModel.create({ phone });
  }

  findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).exec();
  }

  async saveRefreshTokenHash(userId: string, hash: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { refreshTokenHash: hash })
      .exec();
  }
}
