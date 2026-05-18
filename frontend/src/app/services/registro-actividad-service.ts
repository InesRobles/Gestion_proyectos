import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.sevice';

export interface RegistroActividadDTO {
  usuarioId: number;
  hora: string;
  respondido: boolean;
}

export interface RegistroActividad {
  id?: number;
  usuarioId: number;
  fecha?: string;
  hora: string;
  respondido: boolean;
}

@Injectable({ providedIn: 'root' })
export class RegistroActividadService {
  private http = inject(HttpClient);
  private api  = inject(ApiService);

  registrar(dto: RegistroActividadDTO): Observable<RegistroActividad> {
    return this.http.post<RegistroActividad>(`${this.api.apiUrl}/asistencia/actividad`, dto);
  }

  getHoy(): Observable<RegistroActividad[]> {
    return this.http.get<RegistroActividad[]>(`${this.api.apiUrl}/asistencia/actividad/hoy`);
  }

  getPorUsuarioYFecha(usuarioId: number, fecha: string): Observable<RegistroActividad[]> {
    return this.http.get<RegistroActividad[]>(
      `${this.api.apiUrl}/asistencia/actividad?usuarioId=${usuarioId}&fecha=${fecha}`
    );
  }
}
