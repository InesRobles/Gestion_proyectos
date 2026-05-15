import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.sevice';

export interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

export interface LoginResponse {
  id: number;
  nombreReal: string;
  nombreUsuario: string;
  rol: string;
}

export interface RegisterDTO {
  nombreUsuario: string;
  nombreReal: string;
  contrasenaHash: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private apiService = inject(ApiService);

  private sesionSubject = new BehaviorSubject<LoginResponse | null>(this.obtenerSesion());
  sesion$ = this.sesionSubject.asObservable();

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiService.apiUrl}/usuario/login`, datos);
  }

  register(datos: RegisterDTO): Observable<any> {
    return this.http.post(`${this.apiService.apiUrl}/usuario/crear`, datos);
  }

  guardarSesion(usuario: LoginResponse): void {
    localStorage.removeItem('sesion');
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    this.sesionSubject.next(usuario);
  }

  obtenerSesion(): LoginResponse | null {
    const data = localStorage.getItem('usuarioLogado');
    return data ? JSON.parse(data) : null;
  }

  cerrarSesion(): void {
    const sesion = this.obtenerSesion();
    if (sesion?.id) {
      localStorage.removeItem(`profile_foto_${sesion.id}`);
    }
    localStorage.removeItem('usuarioLogado');
    this.sesionSubject.next(null);
  }
  estaLogado(): boolean {
    return !!this.obtenerSesion();
  }
}
