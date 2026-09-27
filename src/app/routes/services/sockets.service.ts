import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private static instanciaActiva = false; // 🔒 Previene múltiples conexiones
  private socket: Socket | null = null;
  public codigoEscaneado$ = new BehaviorSubject<string | null>(null);

  constructor(private ngZone: NgZone) {
    // 🛑 Si ya se instanció una vez, no vuelvas a conectar
    if (SocketService.instanciaActiva) return;

    const usuarioId = this.obtenerUsuarioId();
    const token = this.obtenerToken();
    // Solo conecta en navegador y si hay una sesión válida con usuario
    if (this.esNavegador() === false || !usuarioId || !token) return;

    SocketService.instanciaActiva = true;

    this.socket = io(environment.socketUrl, {
      auth: { token },
      query: { usuarioId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      //console.log('🟢 Socket conectado con ID:', this.socket!.id);
    });

    this.socket.on('disconnect', () => {
      //console.log('🔴 Socket desconectado');
    });

    this.socket.on('nuevo-codigo', (codigo: string) => {
      // 📌 Ejecuta dentro de NgZone para asegurar actualización de Angular
      this.ngZone.run(() => {
      //  console.log('📥 Código recibido por socket:', codigo);
        this.codigoEscaneado$.next(codigo);
      });
    });
  }

  private esNavegador(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  private obtenerToken(): string | null {
    if (this.esNavegador() === false) return null;
    return sessionStorage.getItem('token');
  }

  private obtenerUsuarioId(): number | null {
    if (this.esNavegador() === false) return null;
    try {
      const raw = sessionStorage.getItem('user');
      const id = raw ? JSON.parse(raw)?.usuario_id : null;
      const n = Number(id);
      return Number.isInteger(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  }

  enviarCodigo(usuarioId: number, codigoBarras: string) {
    this.socket?.emit('codigo-escaneado', { usuarioId, codigoBarras });
  }
}
