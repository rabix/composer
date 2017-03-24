import { TestBed, inject } from '@angular/core/testing';

import { LocalFileRepositoryService } from './local-file-repository.service';

describe('LocalFileRepositoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalFileRepositoryService]
    });
  });

  it('should ...', inject([LocalFileRepositoryService], (service: LocalFileRepositoryService) => {
    expect(service).toBeTruthy();
  }));
});
