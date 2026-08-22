import { Component, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogContent } from '@angular/material/dialog';
import { MatDialogActions } from '@angular/material/dialog';
import { MatButton, MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-modal-confirmacion',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
  ],
  templateUrl: './modal-confirmacion.component.html',
  styleUrl: './modal-confirmacion.component.scss'
})
export class ModalConfirmacionComponent implements AfterViewInit{

  @ViewChild('confirmButton') confirmButton!: ElementRef<HTMLButtonElement>;
  constructor(
    public dialogRef: MatDialogRef<ModalConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { productoId: number }
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.confirmButton?.nativeElement.focus(); // Mueve el foco al botón "Eliminar"
    }, 100);
  }

  eliminar(): void {
    this.dialogRef.close(true); // Devuelve `true` al padre para confirmar eliminación
  }

  cancelar(): void {
    this.dialogRef.close(false); // Devuelve `false` al padre si se cancela
  }

}
