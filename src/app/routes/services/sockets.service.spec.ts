import { TestBed } from '@angular/core/testing';

import { SocketService } from './sockets.service';

describe('SocketsService', () => {
  let service: SocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
