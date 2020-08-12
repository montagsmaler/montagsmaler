import { Player } from '../../lobby/models';

export interface IGame {
  readonly id: string;
  readonly createdAt: number;
  readonly players: Player[];
  readonly durationRound: number;
  readonly rounds: number;
}

export class Game implements IGame {
  constructor(
    public readonly id: string,
    public readonly createdAt: number,
    public readonly players: Player[],
    public readonly durationRound: number,
    public readonly rounds: number,
  ) { }

  public get duration(): number {
    return this.durationRound * this.rounds;
  }

  public isPlayerMember(playerId: string): boolean {
    return this.players.findIndex(player => player.id === playerId) !== -1;
  }
}
