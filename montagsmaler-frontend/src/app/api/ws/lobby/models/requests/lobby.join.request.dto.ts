import { IsNotEmpty, IsString } from 'class-validator'

export interface ILobbyJoinRequest {
  lobbyId: string;
}

export class LobbyJoinRequest {

  @IsString()
  @IsNotEmpty()
  lobbyId: string;

  public static fromObject(obj: ILobbyJoinRequest): LobbyJoinRequest {
    const lobbyJoinRequest = new LobbyJoinRequest();
    lobbyJoinRequest.lobbyId = obj.lobbyId;
    return lobbyJoinRequest;
  }
}
