import { TestBed } from '@angular/core/testing';

import { ThresholdService } from './threshold.service';

describe('ThresholdService', () => {
  let service: ThresholdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThresholdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
