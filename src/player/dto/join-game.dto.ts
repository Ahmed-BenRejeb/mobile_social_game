import { IsString } from "class-validator";

export class JoinGameDto {
  @IsString()
  nickname: string;
}
