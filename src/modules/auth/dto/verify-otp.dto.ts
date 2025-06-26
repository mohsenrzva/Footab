import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  otp: string;
}
