import { IsNotEmpty, IsString } from 'class-validator';

export class LobbyLeaveRequestDto {

	@IsString()
	@IsNotEmpty()
	lobbyId: string;
}