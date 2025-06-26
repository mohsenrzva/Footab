import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
