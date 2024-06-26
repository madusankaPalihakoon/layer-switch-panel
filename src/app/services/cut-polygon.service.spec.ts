import { TestBed } from '@angular/core/testing';

import { CutPolygonService } from './cut-polygon.service';

describe('CutPolygonService', () => {
  let service: CutPolygonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CutPolygonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
