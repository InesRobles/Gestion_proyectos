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

  getAlumnoById(id: number): Observable<alumno> {
    return this.http.get<alumno>(`${this.apiService.apiUrl}/alumno/${id}`);
  }

  getProyectos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiService.apiUrl}/proyecto`);
  }
}
