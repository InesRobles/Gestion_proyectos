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

  // Todos los proyectos de la BD
  getProyectos(): Observable<proyecto[]> {
    return this.http.get<proyecto[]>(`${this.apiService.apiUrl}/proyecto`);
  }

  // Proyectos en los que el alumno ya está inscrito
  // El backend debe exponer: GET /asignacion/alumno/{alumnoId}
  getProyectosPorAlumno(alumnoId: number): Observable<proyecto[]> {
    return this.http.get<proyecto[]>(`${this.apiService.apiUrl}/asignacion/alumno/${alumnoId}`);
  }
  getProyectosActivos(alumnoId: number): Observable<proyecto[]> {
    return this.http.get<proyecto[]>(
      `${this.apiService.apiUrl}/proyecto/alumno/${alumnoId}/activos`
    );
  }

  getProyectosDisponibles(alumnoId: number): Observable<proyecto[]> {
    return this.http.get<proyecto[]>(
      `${this.apiService.apiUrl}/proyecto/alumno/${alumnoId}/explorar`
    );
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

  inscribirse(alumnoId: number, proyectoId: number): Observable<any> {
    return this.http.post(`${this.apiService.apiUrl}/asignacion`, { alumnoId, proyectoId });
  }
}
