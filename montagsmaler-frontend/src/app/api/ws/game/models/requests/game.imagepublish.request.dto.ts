import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { plainToClassAndValidate } from 'src/app/api/common';

export interface IGameImagePublishRequest {
  gameId: string;
  forRound: number;
  imageBase64: string;
}

export class GameImagePublishRequest {

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsNumber()
  forRound: number;

  @IsString()
  @IsNotEmpty()
  imageBase64: string;


  public static fromObject(obj: IGameImagePublishRequest): Promise<GameImagePublishRequest> {
    return plainToClassAndValidate(GameImagePublishRequest, obj);
  }
}
