import { IsNotEmpty, IsString } from 'class-validator'
import { plainToClassAndValidate } from 'src/app/api/common';

export interface ILobbyLeaveRequest {
  lobbyId: string;
}

export class LobbyLeaveRequest {

  @IsString()
  @IsNotEmpty()
  lobbyId: string;

  public static fromObject(obj: ILobbyLeaveRequest): Promise<LobbyLeaveRequest> {
    return plainToClassAndValidate(LobbyLeaveRequest, obj);
  }
}
