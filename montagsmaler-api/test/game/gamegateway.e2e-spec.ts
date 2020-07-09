import { getClientWebsocketForAppAndNamespace } from '../ws-client.helper';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { LobbyGateway } from '../../src/api/ws/lobby/lobby-gateway';
import { Namespace } from '../../src/api/ws/namespaces';
import { WsLobbyEvents } from '../../src/api/ws/lobby/ws.lobby.events';
import { WsLobbyModule } from '../../src/api/ws/lobby/ws.lobby.module';

describe('GameGateway e2e', () => {
  let app: INestApplication;
  let lobbyGateway: LobbyGateway;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [WsLobbyModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();

    lobbyGateway = app.get<LobbyGateway>(LobbyGateway);
	});
	
	describe('startGameProcess', () => {
		it('does send back something', (done) => {
			done();
      // const clientSocket: SocketIOClient.Socket = getClientWebsocketForAppAndNamespace(app, Namespace.GAME);
      
      // clientSocket.on(GameEvent.CONNECTED, (payload) => {
      //   if (payload === 'Connection has been established!') {
      //     clientSocket.emit(GameEvent.INIT_GAME, 'Initiliaze Game!');
      //   } else {
      //     throw new Error('Wrong payload!');
      //   }
      // });
      
      // clientSocket.on(GameEvent.GAME_STARTED, (payload) => {
      //   if (payload === 'Game has started!') {
      //     done();
      //   } else {
      //     throw new Error('Wrong payload!');
      //   }
      // });
		});
	});

	afterAll(async (done) => {
		await app.close();
		done();
	});
});