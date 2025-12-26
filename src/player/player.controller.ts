import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';


@ApiTags('Players')
@Controller('players')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    getPlayers() {
        return this.playerService.getPlayers();
    }



}


