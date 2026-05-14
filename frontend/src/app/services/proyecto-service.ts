import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.sevice';
import { proyecto } from '../modelos/proyecto';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

  constructor(private http: HttpClient, private apiService: ApiService) {}

  getProyectos(): Observable<proyecto[]> {
    return this.http.get<proyecto[]>(`${this.apiService.apiUrl}/proyecto`);
  }

  getProyectoById(id: number): Observable<proyecto> {
    return this.http.get<proyecto>(`${this.apiService.apiUrl}/proyecto/${id}`);
  }

  crearProyecto(p: Partial<proyecto>): Observable<proyecto> {
    return this.http.post<proyecto>(`${this.apiService.apiUrl}/proyecto`, p);
  }

  actualizarProyecto(id: number, p: Partial<proyecto>): Observable<proyecto> {
    return this.http.put<proyecto>(`${this.apiService.apiUrl}/proyecto/${id}`, p);
  }

  eliminarProyecto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiService.apiUrl}/proyecto/${id}`);
  }
}
