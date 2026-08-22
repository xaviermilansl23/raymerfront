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
    SocketService.instanciaActiva = true;

    const usuarioId = JSON.parse(sessionStorage.getItem('user') || '{}')?.usuario_id;
   // console.log('🧠 SocketService usuarioId:', usuarioId);

    this.socket = io(environment.socketUrl, {
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

  enviarCodigo(usuarioId: number, codigoBarras: string) {
    this.socket?.emit('codigo-escaneado', { usuarioId, codigoBarras });
  }
}
