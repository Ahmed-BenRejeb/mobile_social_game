import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Game } from 'src/game/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player,Game])],
  providers: [PlayerService],
  controllers: [PlayerController]
})
export class PlayerModule {}
