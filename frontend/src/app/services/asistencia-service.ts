import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.sevice';

export interface AsistenciaDTO {
  id?: number;
  alumnoId: number;
  fecha?: string;
  presente?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private http = inject(HttpClient);
  private api = inject(ApiService);

  fichar(alumnoId: number): Observable<AsistenciaDTO> {
    return this.http.post<AsistenciaDTO>(`${this.api.apiUrl}/asistencia`, { alumnoId });
  }

  haFichadoHoy(alumnoId: number): Observable<AsistenciaDTO> {
    return this.http.get<AsistenciaDTO>(`${this.api.apiUrl}/asistencia/alumno/${alumnoId}/hoy`);
  }

  fichadosHoy(): Observable<AsistenciaDTO[]> {
    return this.http.get<AsistenciaDTO[]>(`${this.api.apiUrl}/asistencia/hoy`);
  }
}
