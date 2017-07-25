import { TestBed, inject } from '@angular/core/testing';

import { ExecutorService } from './executor.service';

describe('ExecutorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExecutorService]
    });
  });

  it('should be created', inject([ExecutorService], (service: ExecutorService) => {
    expect(service).toBeTruthy();
  }));
});
