import { TestBed } from '@angular/core/testing';

import { WsClientService } from './ws-client.service';

describe('WsClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WsClientService = TestBed.get(WsClientService);
    expect(service).toBeTruthy();
  });
});
