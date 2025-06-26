import { IsNotEmpty, IsPhoneNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  @Matches(/^\d{10}$/)
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}
