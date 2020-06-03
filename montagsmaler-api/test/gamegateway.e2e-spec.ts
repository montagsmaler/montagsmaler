import { getClientWebsocketForAppAndNamespace } from './ws-client.helper';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { GameGateway } from '../src/api/ws/game/game-gateway';
import { Namespace } from '../src/api/ws/namespaces';
import { GameEvent } from '../src/api/ws/game/game-events';

describe('GameGateway e2e', () => {
  let app: INestApplication;
  let gameGateway: GameGateway;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();

    gameGateway = app.get<GameGateway>(GameGateway);
	});
	
	describe('startGameProcess', () => {
		it('does send back something', (done) => {
      const clientSocket: SocketIOClient.Socket = getClientWebsocketForAppAndNamespace(app, Namespace.GAME);
      
      clientSocket.on(GameEvent.CONNECTED, (payload) => {
        if (payload === 'Connection has been established!') {
          clientSocket.emit(GameEvent.INIT_GAME, 'Initiliaze Game!');
        } else {
          throw new Error('Wrong payload!');
        }
      });
      
      clientSocket.on(GameEvent.GAME_STARTED, (payload) => {
        if (payload === 'Game has started!') {
          done();
        } else {
          throw new Error('Wrong payload!');
        }
      });
		});
	});
});