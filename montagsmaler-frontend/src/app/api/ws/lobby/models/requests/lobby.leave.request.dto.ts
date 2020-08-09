import { IsNotEmpty, IsString } from 'class-validator'

export interface ILobbyLeaveRequest {
  lobbyId: string;
}

export class LobbyLeaveRequest {

  @IsString()
  @IsNotEmpty()
  lobbyId: string;

  public static fromObject(obj: ILobbyLeaveRequest): LobbyLeaveRequest {
    const lobbyLeaveRequest = new LobbyLeaveRequest();
    lobbyLeaveRequest.lobbyId = obj.lobbyId;
    return lobbyLeaveRequest;
  }
}
