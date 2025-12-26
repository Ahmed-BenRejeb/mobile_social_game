import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { KillTargetDto } from './dto/kill-target.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { CreatePlayerDto } from './dto/create-player.dto';


@ApiTags('Players')
@Controller('games/:gameId/players')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get("game/:gameId")
    getPlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.getPlayers(gameId);
    }

 @Post('create')
  @ApiBody({ type: CreatePlayerDto })
  async createPlayer(@Body() body: CreatePlayerDto) {
    const { nickname } = body;
    return this.playerService.createStandalonePlayer(nickname);
  }
      @Get()
    getAllPlayers() {
        return this.playerService.getAllPlayers();
    }




    @Post('join/:gameId')
  @ApiParam({ name: 'gameId', type: Number })
  @ApiBody({ type: JoinGameDto })
  joinGame(@Param('gameId', ParseIntPipe) gameId: number, @Body() dto: JoinGameDto) {
    return this.playerService.joinGame(gameId, dto.nickname);
  }

  @Post(':playerId/kill')
  @ApiParam({ name: 'gameId', type: Number, example: 1 })
  @ApiParam({ name: 'playerId', type: Number })
  @ApiBody({ type: KillTargetDto })
  killTarget(@Param('gameId', ParseIntPipe) gameId: number, @Param('playerId', ParseIntPipe) playerId: number, @Body() dto: KillTargetDto) {
    return this.playerService.killTarget(playerId, dto.targetCode);
  }

  @Post('assign-targets/:gameId')
  @ApiParam({ name: 'gameId', type: Number })
  @ApiParam({ name: 'gameId', type: Number, example: 1 })
  assignTargets(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.playerService.assignInitialTargets(gameId);
  }


  @Delete(':id')
    @ApiParam({ name: 'id', type: Number })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    deletePlayer(@Param('gameId', ParseIntPipe) gameId: number, @Param('id', ParseIntPipe) id: number) {
        return this.playerService.deletePlayer(gameId, id);
    }

    @Delete('')
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    deleteAllPlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.deleteAllPlayers(gameId);
    }

}


