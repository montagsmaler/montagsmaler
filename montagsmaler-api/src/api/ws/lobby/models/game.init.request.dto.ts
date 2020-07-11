import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class GameInitRequestDto {

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
}