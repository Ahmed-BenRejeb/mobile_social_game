import { ApiParam, ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class KillTargetDto {

  @ApiProperty({ example: '123456', description: 'The secret code of the target player' })
  @IsString()
  targetCode: string; // The secret code of the target
}
