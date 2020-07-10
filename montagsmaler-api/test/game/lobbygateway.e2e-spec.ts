import { getClientWebsocketForAppAndNamespace } from '../ws-client.helper';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { configModuleOptionsFactory } from '../../src/app.module';
import { LobbyGateway } from '../../src/api/ws/lobby/lobby-gateway';
import { Namespace } from '../../src/api/ws/namespaces';
import { WsLobbyEvents } from '../../src/api/ws/lobby/ws.lobby.events';
import { WsLobbyModule } from '../../src/api/ws/lobby/ws.lobby.module';
import { HandleConnection } from '../../src/api/ws/handleconnection';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../../src/api/http/auth/service/auth.service';
import { PublicKeys } from '../../src/api/http/auth/models/aws-token';
import { PUBLIC_KEY } from '../auth/test_keys';
import * as RedisMock from 'ioredis-mock';
import { signedTokenFromMock, mockUserData, mockUser2Data } from '../../src/api/http/auth/service/auth.service.spec';
import { RedisClient } from '../../src/shared/redis';
import { Lobby, LobbyPlayerJoinedEvent } from '../../src/game/lobby/models';
import { LobbyConsumedEvent } from '../../src/game/lobby/models/events/lobby.consumed.event';
const spyOn = jest.spyOn;

describe('LobbyGateway e2e', () => {
  let app: INestApplication;
	let lobbyGateway: LobbyGateway;
	let authService: AuthService;
	let userSocket: SocketIOClient.Socket;
	let user2Socket: SocketIOClient.Socket;
	const tokenUser = signedTokenFromMock(mockUserData);
	const tokenUser2 = signedTokenFromMock(mockUser2Data);
	const redisKeyValueMock = new RedisMock();
	const redisSubMock = new RedisMock();
	const redisPubMock = redisSubMock.createConnectedClient();
	let lobbyId: string;
	let currentLobby: Lobby;
	const SECOND_IN_MILLISECONDS = 10; 

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(configModuleOptionsFactory()), WsLobbyModule],
		})
			.overrideProvider('aws_cognito_issuer_url').useValue(mockUserData.issuer)
			.overrideProvider(RedisClient.KEY_VALUE).useValue(redisKeyValueMock)
			.overrideProvider(RedisClient.PUB).useValue(redisPubMock)
			.overrideProvider(RedisClient.SUB).useValue(redisSubMock)
			.overrideProvider('SECOND_IN_MILLISECONDS').useValue(SECOND_IN_MILLISECONDS)
			.compile();

		app = moduleFixture.createNestApplication();
		authService = app.get<AuthService>(AuthService);

		spyOn(authService as any, 'fetchPublicKeys').mockImplementation(async (): Promise<PublicKeys> => ({ keys: [PUBLIC_KEY] }));

		lobbyGateway = app.get<LobbyGateway>(LobbyGateway);
		
		await app.init();
	});

	it('should be defined', () => {
		expect(app).toBeDefined();
		expect(lobbyGateway).toBeDefined();
	});

	it('should init two client connections to lobby namespace', (done) => {
		userSocket = getClientWebsocketForAppAndNamespace(app, Namespace.LOBBY, tokenUser);     
		userSocket.on(HandleConnection.CONNECTED, (payload) => {
			expect(payload.success).toBeTruthy();
			if (payload && payload.success) {
				user2Socket = getClientWebsocketForAppAndNamespace(app, Namespace.LOBBY, tokenUser2);
				user2Socket.on(HandleConnection.CONNECTED, (payload) => {
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
		user2Socket.on(WsLobbyEvents.CONSUMED, (event: LobbyConsumedEvent) => {
			expect(event).toBeDefined();
			expect(event.player.id).toEqual(mockUserData.id);
			expect(event.game.players).toEqual(currentLobby.members);
			expect(event.game.rounds * event.game.durationRound).toEqual(60 * SECOND_IN_MILLISECONDS);
			if (finished) {
				done();
			}
			finished = true;
		});
		userSocket.on(WsLobbyEvents.CONSUMED, (event: LobbyConsumedEvent) => {
			expect(event).toBeDefined();
			expect(event.player.id).toEqual(mockUserData.id);
			expect(event.game.players).toEqual(currentLobby.members);
			expect(event.game.rounds * event.game.durationRound).toEqual(60 * SECOND_IN_MILLISECONDS);
			if (finished) {
				done();
			}
			finished = true;
		});
		userSocket.emit(WsLobbyEvents.GAME_INIT, { lobbyId: lobbyId, roundDuration: 30, rounds: 2 });
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