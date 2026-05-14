import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.sevice';

export interface Modalidad {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalidadService {

  constructor(private http: HttpClient, private apiService: ApiService) {}

  getModalidades(): Observable<Modalidad[]> {
    return this.http.get<Modalidad[]>(`${this.apiService.apiUrl}/modalidad`);
  }

  crearModalidad(nombre: string): Observable<Modalidad> {
    return this.http.post<Modalidad>(`${this.apiService.apiUrl}/modalidad`, { nombre });
  }

  eliminarModalidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiService.apiUrl}/modalidad/${id}`);
  }
}
