import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { Html5Qrcode } from 'html5-qrcode';
import { ScannerSyncService } from './scanner-sync.service';


@Component({
  selector: 'app-scanner',
  imports: [

    MatDialogModule,
    ZXingScannerModule,
    MatButtonModule

  ],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss'
})
export class ScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scannerContainer', { static: true }) scannerContainer!: ElementRef;
  private html5QrCode!: Html5Qrcode;
  private escaneado = false;

  constructor(
    private dialogRef: MatDialogRef<ScannerComponent>,
    private toastr: ToastrService,
    private sync: ScannerSyncService
  ) {}

  ngAfterViewInit(): void {
    this.html5QrCode = new Html5Qrcode(this.scannerContainer.nativeElement.id);

    this.html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => this.onCodeResult(decodedText),

      (errorMessage) => {
        // Puedes ignorar errores frecuentes
      }
    ).catch((err) => {
      this.toastr.error('Error al iniciar la cámara');
    });
  }
onCodeResult(result: string) {
  if (this.escaneado) return;
  this.escaneado = true;
           const audio = new Audio('/assets/sounds/beep.mp3');
audio.play().catch(err => console.error('Error al reproducir sonido:', err));


  this.sync.setCodigo(result); // ✅ lo envías al servicio

  this.html5QrCode.stop().then(() => {
    this.dialogRef.close(); // no mandas nada por aquí
  });
}

  cancelar() {
    this.html5QrCode.stop().then(() => {
      this.dialogRef.close();
    });
  }

  ngOnDestroy(): void {
    if (this.html5QrCode) {
      try {
        this.html5QrCode.stop().catch(err => console.warn('Error al detener escáner:', err));
      } catch (_err) {
        // El escáner nunca llegó a iniciarse
      }
    }
  }

}
