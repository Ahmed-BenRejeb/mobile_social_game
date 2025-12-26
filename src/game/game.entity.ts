import { Player } from 'src/player/player.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Unique, ManyToOne } from 'typeorm';

export enum GameStatus {
  WAITING = 'WAITING',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.WAITING,
  })
  status: GameStatus;

  @Column()
  @Unique(['code'])
  code: string;
  
  @CreateDateColumn()
  createdAt: Date;
  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;
  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date;


    @OneToMany(() => Player, player => player.game)
    players: Player[];
    @ManyToOne(() => Player, { nullable: true })
winner: Player | null;
}
