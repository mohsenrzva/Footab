import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../users/user.service';
import { OtpService } from '../otp/otp.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private otps: OtpService,
    private jwt: JwtService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    let user = await this.users.findByPhone(dto.phone);
    if (!user) {
      user = await this.users.create(dto.phone);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    await this.otps.saveOtp(dto.phone, otp, expires);
    // Here you would normally send OTP via SMS
    return { otp }; // returning for demo purposes
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.users.findByPhone(dto.phone);
    const otpDoc = await this.otps.findOtp(dto.phone);
    if (!user || !otpDoc || otpDoc.code !== dto.otp || otpDoc.expires < new Date()) {
      throw new UnauthorizedException('Invalid OTP');
    }
    const payload = { sub: user.id, phone: user.phone };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.users.saveRefreshTokenHash(user.id, refreshHash);
    await this.otps.clearOtp(dto.phone);
    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwt.verifyAsync(dto.refreshToken);
      const user = await this.users.findByPhone(payload.phone);
      if (
        !user ||
        !(
          user.refreshTokenHash &&
          (await bcrypt.compare(dto.refreshToken, user.refreshTokenHash))
        )
      ) {
        throw new Error('invalid token');
      }
      const newAccess = await this.jwt.signAsync(
        { sub: user.id, phone: user.phone },
        {
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '30m',
        },
      );
      return { accessToken: newAccess };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
