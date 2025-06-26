import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OtpResponseDto } from './dto/otp-response.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { AccessTokenDto } from './dto/access-token.dto';
import { ProfileDto } from './dto/profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('request-otp')
  @ApiOkResponse({ type: OtpResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto);
  }

  @Post('verify-otp')
  @ApiOkResponse({ type: AuthTokensDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid OTP' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto);
  }

  @Post('refresh')
  @ApiOkResponse({ type: AccessTokenDto })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ProfileDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('profile')
  profile(@Req() req: any) {
    return req.user;
  }
}
