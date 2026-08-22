import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@Component({
  imports:[
    MatDialogModule,
    MatButtonModule
  ],
  selector: 'app-confirm-dialog-usuario',
  template: `
    <h2 mat-dialog-title>¿Eliminar usuario?</h2>
    <mat-dialog-content>
      ¿Estás seguro de que deseas eliminar este usuario?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="warn" (click)="confirmar()">Eliminar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogUsuarioComponent {
    constructor(
    public dialogRef: MatDialogRef<ConfirmDialogUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario_id: number }
  ) {}


    cancelar() {
    this.dialogRef.close(false);
  }

  confirmar() {
    this.dialogRef.close(true);
  }
}
