import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';

const approxKbToBase64Length = (kb: number): number => Math.floor(kb * 1000 * (4 / 3));

export class GameImagePublishRequestDto {

	@IsString()
	@IsNotEmpty()
	gameId: string;

	@IsNumber()
	forRound: number;

	@IsString()
	@IsNotEmpty()
	@MaxLength(approxKbToBase64Length(1000))
	imageBase64: string;
}