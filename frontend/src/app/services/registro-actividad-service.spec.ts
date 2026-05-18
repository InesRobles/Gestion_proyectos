import { TestBed } from '@angular/core/testing';

import { RegistroActividadService } from './registro-actividad-service';

describe('RegistroActividadService', () => {
  let service: RegistroActividadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistroActividadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
