import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { SocketService } from '../services/sockets.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-scanner-barras',
  templateUrl: './scanner-barras.component.html',
  styleUrls: ['./scanner-barras.component.scss'],
})
export class ScannerBarrasComponent implements AfterViewInit, OnDestroy {
  private html5QrCode: Html5Qrcode | null = null;
  private scannerId = 'scanner-barras';
  private scanning = false;

  // 🔁 Para control de debounce
  private ultimoCodigo = '';
  private ultimoTiempo = 0;

  constructor(
    private socketService: SocketService,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit() {
    this.iniciarEscaneo();
  }

  iniciarEscaneo() {
    if (this.scanning) return;

    this.html5QrCode = new Html5Qrcode(this.scannerId);
    const config = { fps: 5, qrbox: { width: 250, height: 150 } };

    this.html5QrCode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText: string) => {
          const ahora = Date.now();

          // 🔒 Evita duplicados del mismo código en <1s
          if (
            decodedText &&
            (decodedText !== this.ultimoCodigo ||
              ahora - this.ultimoTiempo > 1000)
          ) {
            this.ultimoCodigo = decodedText;
            this.ultimoTiempo = ahora;


            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            const usuarioId = Number(user.usuario_id);

            if (usuarioId) {
              this.socketService.enviarCodigo(usuarioId, decodedText);
              this.toastr.info(decodedText,'Codigo Escaneado' );

              const audio = new Audio('/assets/sounds/beep.mp3');
              audio.play().catch((err) =>
                console.error('Error al reproducir sonido:', err)
              );

              // ⏸️ Pausar por 2 segundos antes de aceptar otro
              this.html5QrCode?.pause();
              setTimeout(() => {
                this.html5QrCode?.resume();
              }, 2000);
            }
          }
        },
        (errorMessage) => {
          // Errores de escaneo frecuentes pueden ignorarse
        }
      )
      .then(() => {
        this.scanning = true;
        //console.log('📸 Escáner iniciado');
      })
      .catch((err) => {
        console.error('Error iniciando el escáner', err);
      });
  }

  ngOnDestroy() {
    this.html5QrCode?.stop().catch(() => {});
  }
}
