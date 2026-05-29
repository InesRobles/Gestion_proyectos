import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AsignacionDTO {
  alumnoId: number;
  proyectoId: number;
  nombreAlumno?: string;
  tituloProyecto?: string;
  rol?: string;
}

@Injectable({ providedIn: 'root' })
export class AsignacionService {

  private readonly base = `${environment.apiUrl}/asignacion`;

  constructor(private http: HttpClient) {}

  /** Todos los alumnos (como UsuarioDTO) inscritos en un proyecto */
  getAlumnosPorProyecto(proyectoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/proyecto/${proyectoId}`);
  }

  /** Proyectos en los que está inscrito un usuario (por su usuarioId) */
  getProyectosPorUsuario(usuarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/alumno/${usuarioId}`);
  }

  /** Inscribir un alumno (por usuarioId) en un proyecto */
  inscribir(alumnoId: number, proyectoId: number): Observable<AsignacionDTO> {
    return this.http.post<AsignacionDTO>(this.base, { alumnoId, proyectoId });
  }

  /** Eliminar a un alumno (por usuarioId) de un proyecto */
  salir(alumnoId: number, proyectoId: number): Observable<void> {
    return this.http.delete<void>(this.base, {
      body: { alumnoId, proyectoId }
    });
  }

  /** Cambiar rol de un colaborador en un proyecto */
  cambiarRolColaborador(usuarioId: number, proyectoId: number, rol: string): Observable<AsignacionDTO> {
    return this.http.put<AsignacionDTO>(`${this.base}/rol`, { usuarioId, proyectoId, rol });
  }
}
