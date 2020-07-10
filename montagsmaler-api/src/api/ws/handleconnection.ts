import { Namespace } from './namespaces';

export enum HandleConnection {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected',
}

export interface ConnectionResponse {
	success: boolean;
	timestamp: number;
	namespace: Namespace,
}