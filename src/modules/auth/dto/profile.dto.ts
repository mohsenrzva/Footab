import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  phone: string;
}
