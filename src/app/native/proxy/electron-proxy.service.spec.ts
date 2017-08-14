import { TestBed, inject } from '@angular/core/testing';

import { ElectronProxyService } from './electron-proxy.service';

describe('ElectronProxyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElectronProxyService]
    });
  });

  it('should be created', inject([ElectronProxyService], (service: ElectronProxyService) => {
    expect(service).toBeTruthy();
  }));


});
