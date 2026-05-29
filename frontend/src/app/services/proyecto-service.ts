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

  getProyectos(usuarioId?: number): Observable<proyecto[]> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto`;
    return this.http.get<proyecto[]>(url);
  }

  getProyectosPorAlumno(alumnoId: number): Observable<proyecto[]> {
    return this.http.get<proyecto[]>(`${this.apiService.apiUrl}/asignacion/alumno/${alumnoId}`);
  }

  getProyectoById(id: number, usuarioId?: number): Observable<proyecto> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto/${id}?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto/${id}`;
    return this.http.get<proyecto>(url);
  }

  crearProyecto(p: Partial<proyecto>): Observable<proyecto> {
    return this.http.post<proyecto>(`${this.apiService.apiUrl}/proyecto`, p);
  }

  actualizarProyecto(id: number, p: Partial<proyecto>, usuarioId?: number): Observable<proyecto> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto/${id}?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto/${id}`;
    return this.http.put<proyecto>(url, p);
  }

  eliminarProyecto(id: number, usuarioId?: number): Observable<void> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto/${id}?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto/${id}`;
    return this.http.delete<void>(url);
  }

  inscribirse(alumnoId: number, proyectoId: number): Observable<any> {
    return this.http.post(`${this.apiService.apiUrl}/asignacion`, { alumnoId, proyectoId });
  }

  salir(alumnoId: number, proyectoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiService.apiUrl}/asignacion`, {
      body: { alumnoId, proyectoId }
    });
  }

  getAlumnosPorProyecto(proyectoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiService.apiUrl}/asignacion/proyecto/${proyectoId}`);
  }

  // ─── RESOURCES MANAGEMENT ──────────────────────────────────────────────

  subirDocumento(proyectoId: number, doc: { nombre: string; contenido: string }, usuarioId?: number): Observable<proyecto> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto/${proyectoId}/documento?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto/${proyectoId}/documento`;
    return this.http.post<proyecto>(url, doc);
  }

  eliminarDocumento(proyectoId: number, docId: number, usuarioId?: number): Observable<void> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto/${proyectoId}/documento/${docId}?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto/${proyectoId}/documento/${docId}`;
    return this.http.delete<void>(url);
  }

  subirImagen(proyectoId: number, img: { nombre: string; contenido: string }, usuarioId?: number): Observable<proyecto> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto/${proyectoId}/imagen?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto/${proyectoId}/imagen`;
    return this.http.post<proyecto>(url, img);
  }

  eliminarImagen(proyectoId: number, imgId: number, usuarioId?: number): Observable<void> {
    const url = usuarioId
      ? `${this.apiService.apiUrl}/proyecto/${proyectoId}/imagen/${imgId}?usuarioId=${usuarioId}`
      : `${this.apiService.apiUrl}/proyecto/${proyectoId}/imagen/${imgId}`;
    return this.http.delete<void>(url);
  }
}
