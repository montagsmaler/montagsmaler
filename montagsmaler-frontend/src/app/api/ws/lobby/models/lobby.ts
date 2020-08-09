import { Player } from './player';

export class Lobby {

  constructor(public readonly id: string, public readonly createdAt: number, public members: Player[]) { }

  addPlayer(player: Player): void {
    this.members.push(player);
  }

  public removePlayer(playerRemove: Player): void {
    this.members = this.members.filter(player => player.id !== playerRemove.id);
  }
}
