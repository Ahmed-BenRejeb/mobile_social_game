import { Game } from "src/game/game.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['secretCode', 'game'])
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickname: string;

  @Column()
  secretCode: string;

  @Column({ default: true })
  isAlive: boolean;

  @ManyToOne(() => Game, game => game.players, { onDelete: 'CASCADE' })
  game: Game;

@ManyToOne(() => Player, { nullable: true, onDelete: 'SET NULL' })
currentTarget: Player | null;

@OneToMany(() => Player, player => player.currentTarget)
    killedPlayers: Player[];
  
  @Column({ default: 0 })
  kills: number;


  
}
