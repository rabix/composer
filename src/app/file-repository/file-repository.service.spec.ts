import { TestBed, inject } from '@angular/core/testing';

import { FileRepositoryService } from './file-repository.service';

describe('FileRepositoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileRepositoryService]
    });
  });

  it('should ...', inject([FileRepositoryService], (service: FileRepositoryService) => {
    expect(service).toBeTruthy();
  }));
});
