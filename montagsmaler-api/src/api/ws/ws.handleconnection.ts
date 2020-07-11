import { WsNamespace } from './ws.namespaces';

export enum WsHandleConnection {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
}

export interface WsConnectionResponse {
	success: boolean;
	timestamp: number;
	namespace: WsNamespace,
}