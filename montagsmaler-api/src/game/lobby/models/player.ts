import { Image } from '../../game-round/models/image';
import { JSONSerializable } from '../../../shared/serializable';

@JSONSerializable()
export class Player {
  private score = 0;
  private drawnImages: [Image];

  constructor(public readonly id: string, public readonly name: string) {}

  public scorePoints(points: number): void {
    this.score = this.score + points;
  }

  public getScore(): number {
    return this.score;
  }

  public addImage(image: Image): void {
    this.drawnImages.push(image);
  }

  public getImageInRound(round: number) {
    const image = this.drawnImages.filter(function(item) {
      return item.getRound() === round;
    });
    if (image[0] === undefined)
      throw Error(
        `Player "${this.name}" did not draw an image in round "${round}".`,
      );
    return image[0];
  }

  public getImages(): [Image] {
    return this.drawnImages;
  }
}
