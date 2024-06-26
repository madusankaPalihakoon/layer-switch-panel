import { TestBed } from '@angular/core/testing';

import { GeometryUtilsService } from './geometry-utils.service';

describe('GeometryUtilsService', () => {
  let service: GeometryUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeometryUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
