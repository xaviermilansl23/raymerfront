import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private urlAuth = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * 🔐 Inicia sesión con las credenciales del formulario.
   * El backend devuelve: { token, usuario, sistema }
   */
  login(formData: any): Observable<any> {
    const payload = {
      usuario: formData.usuario,
      contrasena: formData.password || formData.contrasena, // ✅ compatibilidad
    };

    return this.http.post(`${this.urlAuth}auth/login`, payload).pipe(
      tap((response: any) => {
        if (response?.token) {
          // ✅ Guardar token y usuario
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('user', JSON.stringify(response.usuario));

          // 🆕 Guardar información del sistema (RAYMER SRL)
          if (response.sistema) {
            sessionStorage.setItem('sistema', JSON.stringify(response.sistema));
          }
        }
      })
    );
  }

  /**
   * Verifica si el entorno es navegador (no SSR)
   */
  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Obtiene el token almacenado en sessionStorage
   */
  getToken(): string | null {
    return this.isBrowser() ? sessionStorage.getItem('token') : null;
  }

  /**
   * 🧑‍💼 Obtiene los datos del usuario logueado
   */
  getUsuario(): any {
    if (!this.isBrowser()) return null;
    const data = sessionStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  /**
   * 🏢 Obtiene los datos de la empresa RAYMER SRL (config del sistema)
   */
  getSistema(): any {
    if (!this.isBrowser()) return null;
    const data = sessionStorage.getItem('sistema');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Obtiene los roles del usuario desde el token JWT
   */
  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const payload = this.decodeToken(token);
      return payload.roles || [];
    } catch {
      return [];
    }
  }

  /**
   * Obtiene el nombre del usuario logueado desde el token
   */
  getNombreUsuario(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = this.decodeToken(token);
      return payload.nombre || '';
    } catch {
      return '';
    }
  }

  /**
   * Verifica si el token JWT ha expirado
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      if (!payload || typeof payload.exp !== 'number') return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  /**
   * Cierra sesión y limpia la sesión del navegador
   */
  logout(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('sistema'); // 🆕 limpiar también datos de empresa
      window.location.href = '/login';
    }
  }

  /**
   * Decodifica el payload del token JWT (maneja base64url y padding)
   */
  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    if (!payload) throw new Error('Token mal formado');

    // base64url -> base64 y agrega padding si falta
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }
}
