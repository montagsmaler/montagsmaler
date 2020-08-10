import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/internal/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { WsMessage } from './models/ws-client.response';

export interface IWsConnection {
  sendMessage<T>(event: string, msg: T): void;
  getMessages$<T>(event: string): Observable<T>;
  unsubscribeEvent(event: string): void;
  close(): void;
}

export class RxjsWsConnection implements IWsConnection {
  constructor(protected readonly websocketSubject: WebSocketSubject<WsMessage>) { }

  close(): void {
    this.websocketSubject.complete();
  }

  sendMessage<T>(event: string, msg: T): void {
    this.websocketSubject.next({ event, data: msg });
  }

  getMessages$<T>(event: string): Observable<T> {
    return this.websocketSubject.pipe(
      filter(wsMessage => wsMessage.event === event),
      map(wsMessage => wsMessage.data as T),
    );
  }

  unsubscribeEvent(event: string): void {

  }
}


export class WsConnection implements IWsConnection {

  protected readonly listeningEvents = new Map<string, Subject<unknown>>();
  protected readonly subscriberCount = new Map<string, number>();

  constructor(protected readonly socket: SocketIOClient.Socket) {
  }

  close(): void {
    this.socket.close();
  }

  sendMessage<T>(event: string, msg: T): void {
    this.socket.emit(event, msg);
  }

  getMessages$<T>(event: string): Observable<T> {
    let events = this.listeningEvents.get(event) as Subject<T>;
    if (!events) {
      events = new Subject<T>();
      this.socket.on(event, (socketEvent: T) => events.next(socketEvent));
      this.listeningEvents.set(event, events);
    }
    this.incrementSubscription(event);
    return events;
  }

  unsubscribeEvent(event: string): void {
    try {
      if (this.decrementSubscription(event) <= 0) {
        this.socket.off(event);
        this.listeningEvents.get(event).complete();
        this.listeningEvents.delete(event);
      }
    } catch (err) {
      console.warn(err);
    }
  }

  protected incrementSubscription(event: string): number {
    const subscriberCount = this.subscriberCount.get(event);
    const newSubscriberCount = subscriberCount ? (subscriberCount +  1) : 1;
    this.subscriberCount.set(event, newSubscriberCount);
    return newSubscriberCount;
  }

  protected decrementSubscription(event: string): number {
    const newSubscriberCount = this.subscriberCount.get(event) - 1;
    if (newSubscriberCount <= 0) {
      this.subscriberCount.delete(event);
    } else {
      this.subscriberCount.set(event, newSubscriberCount);
    }
    return newSubscriberCount;
  }
}
