import { GameStateContext } from '../GameStateContext';
import { Game } from '../../../game-round/models';
import { Player } from '../../../lobby/models';

describe('game-state', () => {
	const testGameId = 'game12345678';
	const testPlayer = new Player('player12345', 'niklas');
	const testPlayer2 = new Player('player54321', 'lucas');
	const testGame = new Game(testGameId, new Date().getTime(), [testPlayer, testPlayer2], 75_000, 2);
	const context = new GameStateContext(testGame);

	it('should be defined', () => {
		expect(context).toBeDefined();
	});

	it('should accept start game', () => {
		const stateAccepted = context.startGame();
		expect(stateAccepted.currentState).toEqual('GameNotStarted');
		expect(stateAccepted.accepted).toBeTruthy();
		expect(context.getCurrentState()).toEqual('GameStarted');
	});

	it('should not accept start game', () => {
		const stateAccepted = context.startGame();
		expect(stateAccepted.currentState).toEqual('GameStarted');
		expect(stateAccepted.accepted).toBeFalsy();
		expect(context.getCurrentState()).toEqual('GameStarted');
	});

	it('should accept start round', () => {
		const stateAccepted = context.startRound();
		expect(stateAccepted.currentState).toEqual('GameStarted');
		expect(stateAccepted.accepted).toBeTruthy();
		expect(context.getCurrentState()).toEqual('RoundStarted');
	});

	it('should accept image', () => {
		const stateAccepted = context.publishImage(testPlayer.id, 1);
		expect(stateAccepted.currentState).toEqual('RoundStarted');
		expect(stateAccepted.accepted).toBeTruthy();
		expect(context.getCurrentState()).toEqual('RoundStarted');
	});

	it('should not accept image', () => {
		expect(context.publishImage(testPlayer.id, 1).accepted).toBeFalsy(); //already submitted for the round
		expect(context.publishImage('1313131221', 1).accepted).toBeFalsy(); //unknown id
		expect(context.publishImage(testPlayer.id, 2).accepted).toBeFalsy(); // next round hasnt started yet
		expect(context.getCurrentState()).toEqual('RoundStarted');
	});

	it('should accept end round', () => {
		const stateAccepted = context.endRound();
		expect(stateAccepted.currentState).toEqual('RoundStarted');
		expect(stateAccepted.accepted).toBeTruthy();
		expect(context.getCurrentState()).toEqual('RoundEnded');
	});

	it('should not accept image', () => {
		expect(context.publishImage(testPlayer.id, 2).accepted).toBeFalsy(); // next round hasnt started yet
		expect(context.getCurrentState()).toEqual('RoundEnded');
	});

	it('should not accept end game', () => {
		const stateAccepted = context.endGame();
		expect(stateAccepted.currentState).toEqual('RoundEnded');
		expect(stateAccepted.accepted).toBeFalsy(); // game has more rounds to play
		expect(context.getCurrentState()).toEqual('RoundEnded');
	});

	it('should accept start new round', () => {
		const stateAccepted = context.startRound();
		expect(stateAccepted.currentState).toEqual('RoundEnded');
		expect(stateAccepted.accepted).toBeTruthy();
		expect(context.getCurrentState()).toEqual('RoundStarted');
	});

	it('should accept image now', () => {
		expect(context.publishImage(testPlayer.id, 2).accepted).toBeTruthy(); // next round started
		expect(context.getCurrentState()).toEqual('RoundStarted');
	});

	it('should accept end round again', () => {
		const stateAccepted = context.endRound();
		expect(stateAccepted.currentState).toEqual('RoundStarted');
		expect(stateAccepted.accepted).toBeTruthy();
		expect(context.getCurrentState()).toEqual('RoundEnded');
	});

	it('should accept end game', () => {
		const stateAccepted = context.endGame();
		expect(stateAccepted.currentState).toEqual('RoundEnded');
		expect(stateAccepted.accepted).toBeTruthy();
		expect(context.getCurrentState()).toEqual('GameEnded');
	});

	it('should not accept image', () => {
		expect(context.publishImage(testPlayer.id, 2).accepted).toBeFalsy(); // game has ended
		expect(context.getCurrentState()).toEqual('GameEnded');
	});
});