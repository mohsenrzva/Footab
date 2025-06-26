import { ApiProperty } from '@nestjs/swagger';

export class OtpResponseDto {
  @ApiProperty()
  otp: string;
}
