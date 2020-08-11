import * as io from 'socket.io-client';
import { INestApplication } from "@nestjs/common";

export const getClientWebsocketForAppAndNamespace = (app: INestApplication, namespace: string, bearerToken?: string, query?: object): SocketIOClient.Socket  => {
	const httpServer = app.getHttpServer();
	if (!httpServer.address()) {
		httpServer.listen(0);
	}

	const options = { query };

	/*
	if (bearerToken) {
		const bearerAuth = {
			Authorization: `Bearer ${bearerToken}`,
		};

		if (options.query) {
			options.query['Authorization'] = `Bearer ${bearerToken}`;
		} else {
			options.query = bearerAuth;
		}

		options['extraHeaders'] = bearerAuth;
	}*/

	return io(`http://127.0.0.1:${httpServer.address().port}/${namespace}?authorization=Bearer ${bearerToken || ''}`, options);
};