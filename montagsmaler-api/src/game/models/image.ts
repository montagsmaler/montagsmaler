import { Player } from './player';
import { JSONSerializable } from '../../shared/serializable';

@JSONSerializable()
export class Image {
  constructor(
    public readonly id: string,
    public readonly createdAt: number,
    public readonly imageAddress: string,
    public readonly player: Player,
    public readonly round: number,
  ) {}

  public getRound(): number {
    return this.round;
  }
}
