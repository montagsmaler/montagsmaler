import { Player } from '../../lobby/models';

export class Game {
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
