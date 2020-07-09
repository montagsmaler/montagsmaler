import { Player } from '../../lobby/models/player';
import { JSONSerializable } from '../../../shared/serializable';

@JSONSerializable()
export class Image {
  constructor(
    public readonly id: string,
    public readonly createdAt: number,
    public readonly imageUrl: string,
    public readonly player: Player,
		public readonly round: number,
		public readonly points: number,
  ) {}

  public getRound(): number {
    return this.round;
	}
	
	/*public static fromS3Object(s3objekt): Image {
		return new Image....
	}*/
}
