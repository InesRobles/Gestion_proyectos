import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.sevice';

export interface Usuario {
  id: number;
  nombreReal: string;
  nombreUsuario: string;
  contrasenaHash?: string;
  rol: 'administrador' | 'alumno' | string;
  modalidad?: string;
  modalidadId?: number;
  modalidadNombre?: string;
}

export interface CambioPasswordDTO {
  contrasenaActual: string;
  contrasenaNueva: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  constructor(private http: HttpClient, private apiService: ApiService) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiService.apiUrl}/usuario/listar`);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiService.apiUrl}/usuario/buscar/${id}`);
  }

  crearUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiService.apiUrl}/usuario/crear`, usuario);
  }

  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiService.apiUrl}/usuario/editar/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiService.apiUrl}/usuario/eliminar/${id}`);
  }

  actualizarPassword(id: number, dto: CambioPasswordDTO): Observable<void> {
    return this.http.put<void>(`${this.apiService.apiUrl}/usuario/cambiar-password/${id}`, dto);
  }

  actualizarFoto(id: number, fotoBase64: string): Observable<void> {
    return this.http.put<void>(`${this.apiService.apiUrl}/usuario/foto/${id}`, { fotoBase64 });
  }

  actualizarModalidad(usuarioId: number, modalidadId: number): Observable<void> {
    return this.http.put<void>(`${this.apiService.apiUrl}/usuario/${usuarioId}/modalidad/${modalidadId}`, {});
  }
}
