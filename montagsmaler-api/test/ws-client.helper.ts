import * as io from 'socket.io-client';
import { INestApplication } from "@nestjs/common";

export const getClientWebsocketForAppAndNamespace = (app: INestApplication, namespace: string, query?: object): SocketIOClient.Socket  => {
	const httpServer = app.getHttpServer();
	if (!httpServer.address()) {
		httpServer.listen(0);
	}

	return io(`http://127.0.0.1:${httpServer.address().port}/${namespace}`, { query });
};