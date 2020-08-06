import { IsNotEmpty, IsString } from 'class-validator';

export class GameJoinRequestDto {

	@IsString()
	@IsNotEmpty()
	gameId: string;
}