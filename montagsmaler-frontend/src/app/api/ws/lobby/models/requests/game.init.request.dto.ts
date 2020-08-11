import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';
import { plainToClassAndValidate } from 'src/app/api/common';

export interface IGameInitRequest {
  lobbyId: string;
  roundDuration: number;
  rounds: number;
}

export class GameInitRequest implements IGameInitRequest {
  @IsString()
  @IsNotEmpty()
  lobbyId: string;

  @IsNumber()
  @Min(30)
  @Max(300)
  roundDuration: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  rounds: number;

  public static fromObject(obj: IGameInitRequest): Promise<GameInitRequest> {
    return plainToClassAndValidate<GameInitRequest, IGameInitRequest>(GameInitRequest, obj);
  }
}
