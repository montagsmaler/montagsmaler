import { Player } from './player';

export class Lobby {

  constructor(public readonly id: string, public readonly createdAt: number, public members: Player[]) { }

  public addPlayer(player: Player): void {
    if (!this.isPlayerMember(player)) {
      this.members.push(player);
    }
  }

  public isPlayerMember(playerMember: Player): boolean {
    return !(this.members.findIndex(player => player.id === playerMember.id) === -1);
  }

  public removePlayer(playerRemove: Player): void {
    this.members = this.members.filter(player => player.id !== playerRemove.id);
  }
}
