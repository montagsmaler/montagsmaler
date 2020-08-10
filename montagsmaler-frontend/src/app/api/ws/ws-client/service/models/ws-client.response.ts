export interface WsMessage<T = any> {
  event: string;
  data: T;
}
