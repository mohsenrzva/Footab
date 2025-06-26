import { IsNotEmpty, IsPhoneNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  @Matches(/^\d{10}$/)
  phone: string;
}
