import { ApiParam, ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class JoinGameDto {
  @ApiProperty({ example: 'JohnDoe', description: 'Player nickname' })
  @IsString()
  nickname: string;
}
