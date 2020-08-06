import { IsNotEmpty, IsString } from 'class-validator';

export class LobbyJoinRequestDto {

	@IsString()
	@IsNotEmpty()
	lobbyId: string;
}