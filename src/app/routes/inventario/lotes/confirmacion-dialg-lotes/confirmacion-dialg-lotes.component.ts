import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-confirmacion-dialg-lotes',
  imports: [
    MatDialogModule,
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './confirmacion-dialg-lotes.component.html',
  styleUrl: './confirmacion-dialg-lotes.component.scss'
})
export class ConfirmacionDialgLotesComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmacionDialgLotesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { loteNombre: string }
  ) {}

  confirmar(): void {
    this.dialogRef.close(true); // Cierra el modal y devuelve "true"
  }

  cancelar(): void {
    this.dialogRef.close(false); // Cierra el modal y devuelve "false"
  }
}
