import { Player } from '../../lobby/models';

export interface GameImage {
  readonly id: string;
  readonly createdAt: number;
  readonly imageUrl: string;
  readonly player: Player;
  readonly round: number;
  readonly score: number;
}
