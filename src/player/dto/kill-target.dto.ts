import { IsString } from "class-validator";

export class KillTargetDto {
  @IsString()
  targetCode: string; // The secret code of the target
}
