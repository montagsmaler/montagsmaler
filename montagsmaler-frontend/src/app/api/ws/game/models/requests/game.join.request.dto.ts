import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { plainToClassAndValidate } from 'src/app/api/common';

export interface IGameJoinRequest {
  gameId: string;
}

export class GameJoinRequest {

  @IsString()
  @IsNotEmpty()
  gameId: string;

  public static fromObject(obj: IGameJoinRequest): Promise<GameJoinRequest> {
    return plainToClassAndValidate(GameJoinRequest, obj);
  }
}
