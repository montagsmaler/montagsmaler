import { IsNotEmpty, IsString } from 'class-validator'
import { plainToClassAndValidate } from 'src/app/api/common';

export interface ILobbyJoinRequest {
  lobbyId: string;
}

export class LobbyJoinRequest {

  @IsString()
  @IsNotEmpty()
  lobbyId: string;

  public static fromObject(obj: ILobbyJoinRequest): Promise<LobbyJoinRequest> {
    return plainToClassAndValidate(LobbyJoinRequest, obj);
  }
}
