import { getClientWebsocketForAppAndNamespace } from '../ws-client.helper';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { configModuleOptionsFactory } from '../../src/app.module';
import { LobbyGateway } from '../../src/api/ws/lobby/lobby-gateway';
import { WsNamespace } from '../../src/api/ws/ws.namespaces';
import { WsLobbyEvents } from '../../src/api/ws/lobby/ws.lobby.events';
import { WsLobbyModule } from '../../src/api/ws/lobby/ws.lobby.module';
import { WsHandleConnection } from '../../src/api/ws/ws.handleconnection';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../../src/api/http/auth/service/auth.service';
import { PublicKeys } from '../../src/api/http/auth/models/aws-token';
import { PUBLIC_KEY } from '../auth/test_keys';
import * as RedisMock from 'ioredis-mock';
import { signedTokenFromMock, mockUserData, mockUser2Data } from '../../src/api/http/auth/service/auth.service.spec';
import { RedisClient } from '../../src/shared/redis';
import { Lobby, LobbyPlayerJoinedEvent } from '../../src/game/lobby/models';
import { LobbyConsumedEvent } from '../../src/game/lobby/models/events/lobby.consumed.event';
import { GameGateway } from '../../src/api/ws/game/game.gateway';
import { WsGameModule } from '../../src/api/ws/game/ws.game.module';
import { Game, GameStartedEvent, NewGameRoundEvent, GameRoundOverEvent, GameOverEvent, GameImageAddedEvent } from '../../src/game/game-round/models';
import { WsGameEvents } from '../../src/api/ws/game/ws.game.events';
import { GameJoinRequestDto, GameImagePublishRequestDto } from '../../src/api/ws/game/models';
import { ImageService } from '../../src/game/image';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { DetectLabelsResponse } from 'aws-sdk/clients/rekognition';
const spyOn = jest.spyOn;

describe('Game e2e', () => {
	let app: INestApplication;
	let lobbyGateway: LobbyGateway;
	let gameGateway: GameGateway;
	let authService: AuthService;
	let imageService: ImageService;
	let userSocket: SocketIOClient.Socket;
	let user2Socket: SocketIOClient.Socket;
	const expectedLabel = 'bird'
	const testLabels: DetectLabelsResponse = {
		Labels: [
			{
				Name: expectedLabel,
				Confidence: 98.87621307373,
			}
		]
	};
	const tokenUser = signedTokenFromMock(mockUserData);
	const tokenUser2 = signedTokenFromMock(mockUser2Data);
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();
	let lobbyId: string;
	let currentLobby: Lobby;
	let gameId: string;
	const SECOND_IN_MILLISECONDS = 50;
	const testedEvents = [WsGameEvents.GAME_STARTED, WsGameEvents.ROUND_STARTED, WsGameEvents.IMAGE_ADDED, WsGameEvents.ROUND_OVER, WsGameEvents.GAME_OVER];

	beforeAll(async () => {
		const moduleFixture = await Test.createTestingModule({
			imports: [ConfigModule.forRoot(configModuleOptionsFactory()), WsLobbyModule, WsGameModule],
		})
			.overrideProvider('aws_cognito_issuer_url').useValue(mockUserData.issuer)
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.overrideProvider('SECOND_IN_MILLISECONDS').useValue(SECOND_IN_MILLISECONDS)
			.overrideProvider('rekognitionNouns').useValue([expectedLabel])
			.compile();

		app = moduleFixture.createNestApplication();
		authService = app.get<AuthService>(AuthService);
		imageService = app.get<ImageService>(ImageService);

		spyOn(authService as any, 'fetchPublicKeys').mockImplementation(async (): Promise<PublicKeys> => ({ keys: [PUBLIC_KEY] }));
		spyOn(imageService['s3Service'], 'upload').mockImplementation(async (): Promise<ManagedUpload.SendData> => ({ Bucket: 'test', Location: '127.0.0.1',  ETag: 'test', Key: '12345678.jpg'}));
		spyOn(imageService['rekognitionService'], 'recognize').mockImplementation(async (): Promise<DetectLabelsResponse> => (testLabels));

		lobbyGateway = app.get<LobbyGateway>(LobbyGateway);
		gameGateway = app.get<GameGateway>(GameGateway);

		await app.init();
	});

	it('should be defined', () => {
		expect(app).toBeDefined();
		expect(lobbyGateway).toBeDefined();
		expect(gameGateway).toBeDefined();
	});

	it('should init two client connections to lobby namespace', (done) => {
		userSocket = getClientWebsocketForAppAndNamespace(app, WsNamespace.LOBBY, tokenUser);
		userSocket.on(WsHandleConnection.CONNECTED, (payload) => {
			expect(payload.success).toBeTruthy();
			if (payload && payload.success) {
				user2Socket = getClientWebsocketForAppAndNamespace(app, WsNamespace.LOBBY, tokenUser2);
				user2Socket.on(WsHandleConnection.CONNECTED, (payload) => {
					expect(payload.success).toBeTruthy();
					done();
				});
			}
		});
	});

	it('should init lobby', (done) => {
		userSocket.on(WsLobbyEvents.GET_LOBBY, (lobby: Lobby) => {
			expect(lobby).toBeDefined();
			expect(lobby.id).toBeDefined();
			lobbyId = lobby.id;
			done();
		});
		userSocket.emit(WsLobbyEvents.INIT_LOBBY);
	});

	it('should join lobby and push notification', (done) => {
		let finished = false;
		user2Socket.on(WsLobbyEvents.GET_LOBBY, (lobby: Lobby) => {
			expect(lobby).toBeDefined();
			expect(lobby.id).toBeDefined();
			expect(lobby.id).toEqual(lobbyId);
			expect(lobby['members'].length).toEqual(2);
			currentLobby = lobby;
			if (finished) {
				done();
			}
			finished = true;
		});
		userSocket.on(WsLobbyEvents.PLAYER_JOINED, (event: LobbyPlayerJoinedEvent) => {
			expect(event).toBeDefined();
			expect(event.player).toBeDefined();
			if (finished) {
				done();
			}
			finished = true;
		});
		user2Socket.emit(WsLobbyEvents.PLAYER_JOINED, { lobbyId: lobbyId });
	});

	it('should consume lobby and push notification', (done) => {
		let finished = false;
		const roundDuration = 30;
		const rounds = 2;
		user2Socket.on(WsLobbyEvents.CONSUMED, (event: LobbyConsumedEvent) => {
			expect(event).toBeDefined();
			expect(event.player.id).toEqual(mockUserData.id);
			expect(event.game.id).toBeDefined();
			expect(event.game.players).toEqual(currentLobby['members']);
			expect(event.game.rounds * event.game.durationRound).toEqual(roundDuration * rounds * SECOND_IN_MILLISECONDS);
			if (finished) {
				done();
			}
			finished = true;
		});
		userSocket.on(WsLobbyEvents.CONSUMED, (event: LobbyConsumedEvent) => {
			expect(event).toBeDefined();
			expect(event.player.id).toEqual(mockUserData.id);
			expect(event.game.id).toBeDefined();
			gameId = event.game.id;
			expect(event.game.players).toEqual(currentLobby['members']);
			expect(event.game.rounds * event.game.durationRound).toEqual(roundDuration * rounds * SECOND_IN_MILLISECONDS);
			if (finished) {
				done();
			}
			finished = true;
		});
		userSocket.emit(WsLobbyEvents.GAME_INIT, { lobbyId: lobbyId, roundDuration, rounds });
	});

	it('should init two client connections to game namespace', (done) => {
		let finished = false;
		userSocket = getClientWebsocketForAppAndNamespace(app, WsNamespace.GAME, tokenUser);
		user2Socket = getClientWebsocketForAppAndNamespace(app, WsNamespace.GAME, tokenUser2);
		userSocket.on(WsHandleConnection.CONNECTED, (payload) => {
			expect(payload.success).toBeTruthy();
			if (finished) {
				done();
			}
			finished = true;
		});
		user2Socket.on(WsHandleConnection.CONNECTED, (payload) => {
			expect(payload.success).toBeTruthy();
			if (finished) {
				done();
			}
			finished = true;
		});
	});

	it('should join game', (done) => {
		let finished = false;
		userSocket.on(WsGameEvents.GET_GAME, (game: Game) => {
			expect(game).toBeDefined();
			expect(game.id).toBeDefined();
			expect(game.id).toEqual(gameId);
			if (finished) {
				done();
			}
			finished = true;
		});
		user2Socket.on(WsGameEvents.GET_GAME, (game: Game) => {
			expect(game).toBeDefined();
			expect(game.id).toBeDefined();
			expect(game.id).toEqual(gameId);
			if (finished) {
				done();
			};
			finished = true;
		});
		const request: GameJoinRequestDto = { gameId: gameId };
		userSocket.emit(WsGameEvents.JOIN_GAME, request);
		user2Socket.emit(WsGameEvents.JOIN_GAME, request);
	});

	it('should receive game events', (done) => {
		const finished = {};
		let currentEventId = 0;
		userSocket.on(WsGameEvents.GAME_STARTED, (event: GameStartedEvent) => {
			expect(event).toBeDefined();
			expect(event.id).toBeDefined();
			expect(event.id).toBeGreaterThan(currentEventId);
			currentEventId = event.id;
			expect(event['game'].id).toEqual(gameId);
			finished[WsGameEvents.GAME_STARTED] = true;
		});

		const imageAddedCb = jest.fn((event: GameImageAddedEvent) => {
			expect(event).toBeDefined();
			expect(event.id).toBeDefined();
			expect(event.id).toBeGreaterThan(currentEventId);
			currentEventId = event.id;
			expect(event.gameId).toEqual(gameId);
			expect(event.image.player.id).toEqual(mockUser2Data.id);
			finished[WsGameEvents.IMAGE_ADDED] = true;
		});
		userSocket.on(WsGameEvents.IMAGE_ADDED, imageAddedCb);

		let round = 1;
		const newGameRoundCb = jest.fn((event: NewGameRoundEvent) => {
			expect(event).toBeDefined();
			expect(event.id).toBeDefined();
			expect(event.id).toBeGreaterThan(currentEventId);
			currentEventId = event.id;
			expect(event['game'].id).toEqual(gameId);
			finished[WsGameEvents.ROUND_STARTED] = true;
			const request: GameImagePublishRequestDto = { gameId: gameId, forRound: round, imageBase64: 'feeek' };
			user2Socket.emit(WsGameEvents.PUBLISH_IMAGE, request);
			++round;
		});
		userSocket.on(WsGameEvents.ROUND_STARTED, newGameRoundCb);

		const gameRoundOverCb = jest.fn((event: GameRoundOverEvent) => {
			expect(event).toBeDefined();
			expect(event.id).toBeDefined();
			expect(event.id).toBeGreaterThan(currentEventId);
			currentEventId = event.id;
			expect(event['game'].id).toEqual(gameId);
			finished[WsGameEvents.ROUND_OVER] = true;
		});
		userSocket.on(WsGameEvents.ROUND_OVER, gameRoundOverCb);

		userSocket.on(WsGameEvents.GAME_OVER, (event: GameOverEvent) => {
			expect(event).toBeDefined();
			expect(event.id).toBeDefined();
			expect(event.id).toBeGreaterThan(currentEventId);
			currentEventId = event.id;
			expect(event['game'].id).toEqual(gameId);
			finished[WsGameEvents.GAME_OVER] = true;

			for (const testedEvent of testedEvents) {
				expect(finished[testedEvent]).toBeTruthy();
			}
			expect(gameRoundOverCb).toHaveBeenCalledTimes(2);
			expect(newGameRoundCb).toHaveBeenCalledTimes(2);
			expect(imageAddedCb).toHaveBeenCalledTimes(2);
			done();
		});
	});

	afterAll(async (done) => {
		if (userSocket) {
			userSocket.close();
		}
		if (user2Socket) {
			userSocket.close();
		}
		await app.close();
		done();
	});
});