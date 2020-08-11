import { Player } from '../../lobby/models';

export class GameImage {
  constructor(
    public readonly id: string,
    public readonly createdAt: number,
    public readonly imageUrl: string,
    public readonly player: Player,
    public readonly round: number,
    public readonly score: number,
  ) { }

}
