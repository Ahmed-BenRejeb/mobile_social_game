import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from 'src/game/game.entity';


@Injectable()
export class PlayerService {
    constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async getPlayers(): Promise<Player[]> {
    return this.playerRepository.find();
  }

  async joinGame(gameId: number, nickname: string) {
  const game = await this.gameRepository.findOne({ where: { id: gameId } });
  if (!game) throw new NotFoundException('Game not found');
  if (game.status !== GameStatus.WAITING)
    throw new BadRequestException('Cannot join a game that has started');

  let code: string = '';
    let exists = true;
while (exists) {
  code = Math.floor(100000 + Math.random() * 900000).toString();
  const existingPlayer = await this.playerRepository.findOne({ 
    where: { game: { id: gameId }, secretCode: code } 
  });
  exists = !!existingPlayer; // convert to boolean
}


  const player = this.playerRepository.create({
    nickname,
    secretCode: code,
    game,
    isAlive: true,
  });

  return this.playerRepository.save(player);
}

async assignInitialTargets(gameId: number) {
  const players = await this.playerRepository.find({
    where: { game: { id: gameId }, isAlive: true },
  });

  if (players.length < 4) throw new BadRequestException('Not enough players');

  // Shuffle players randomly
  const shuffled = players.sort(() => Math.random() - 0.5);

  // Assign targets in a circular way
  for (let i = 0; i < shuffled.length; i++) {
    shuffled[i].currentTarget = shuffled[(i + 1) % shuffled.length];
  }

  await this.playerRepository.save(shuffled);
}
async killTarget(killerId: number, targetCode: string) {
  const killer = await this.playerRepository.findOne({
    where: { id: killerId },
    relations: ['currentTarget', 'currentTarget.currentTarget'],
  });

  if (!killer) throw new NotFoundException('Player not found');

  const target = await this.playerRepository.findOne({
    where: { secretCode: targetCode, game: { id: killer.game.id } },
    relations: ['currentTarget'],
  });

  if (!target || !target.isAlive)
    throw new BadRequestException('Invalid target');
  if (killer.currentTarget == null)
    throw new BadRequestException('You have no assigned target');

  if (killer.currentTarget.id !== target.id)
    throw new BadRequestException('This is not your assigned target');

  // Inherit kills
  killer.kills += 1 + target.kills;

  // Update killer's target
  killer.currentTarget = target.currentTarget;

  // Mark target as dead
  target.isAlive = false;
  target.currentTarget = null;

  await this.playerRepository.save([killer, target]);

  // Update other affected players
  await this.reassignTargetsForDead(target.id);
}


async reassignTargetsForDead(deadPlayerId: number) {
  const affectedPlayers = await this.playerRepository.find({
    where: { currentTarget: { id: deadPlayerId }, isAlive: true },
    relations: ['currentTarget', 'currentTarget.currentTarget'],
  });

  for (const player of affectedPlayers) {
    if (!player.currentTarget) continue;
    let newTarget = player.currentTarget.currentTarget;

    // Skip dead targets recursively
    while (newTarget && !newTarget.isAlive) {
      newTarget = newTarget.currentTarget;
    }

    player.currentTarget = newTarget || null;
  }

  await this.playerRepository.save(affectedPlayers);
}






}


