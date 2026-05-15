import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from "./api.sevice";
import { alumno } from "../modelos/alumno";

@Injectable({
  providedIn: 'root'
})
export class AlumnoService {

  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAlumnos(): Observable<alumno[]> {
    return this.http.get<alumno[]>(`${this.apiService.apiUrl}/alumno`);
  }

  // Busca por alumno.id
  getAlumnoById(id: number): Observable<alumno> {
    return this.http.get<alumno>(`${this.apiService.apiUrl}/alumno/${id}`);
  }

  // Busca el alumno asociado a un usuario (por usuario.id de sesión)
  getAlumnoByUsuarioId(usuarioId: number): Observable<alumno> {
    return this.http.get<alumno>(`${this.apiService.apiUrl}/alumno/usuario/${usuarioId}`);
  }

  getProyectos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiService.apiUrl}/proyecto`);
  }

  getHorarioAlumno(alumnoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiService.apiUrl}/horario/alumno/${alumnoId}`);
  }

  crearHorario(horario: { alumnoId: number; diaSemana: string; horaInicio: string; horaFin: string }): Observable<any> {
    return this.http.post<any>(`${this.apiService.apiUrl}/horario`, horario);
  }
}
