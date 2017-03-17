import { TestBed, inject } from '@angular/core/testing';

import { DataGatewayService } from './data-gateway.service';

describe('DataGatewayService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataGatewayService]
    });
  });

  it('should ...', inject([DataGatewayService], (service: DataGatewayService) => {
    expect(service).toBeTruthy();
  }));
});
