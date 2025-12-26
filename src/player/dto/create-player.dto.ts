// create-player.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Player1' })
  @IsString()
  nickname: string;
}
